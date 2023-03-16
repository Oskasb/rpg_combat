import {PipelineObject} from '../../application/load/PipelineObject.js';

class ThreeShaderBuilder {
    constructor() {
        this.shaderChunks = {};
        this.shaderDataIndex = {};
        this.buildTimeout;
        this.gl;
        this.okCount = 0;
    }
        loadShaderData = function(glContext) {

           let shaderChunks = this.shaderChunks;
           let shaderDataIndex = this.shaderDataIndex;
           let buildTimeout = this.buildTimeout;
           this.gl = glContext;
           let gl = this.gl;
           let okCount = this.okCount;

        let testShader = function( src, type ) {

            var types = {
                fragment:gl.FRAGMENT_SHADER,
                vertex:gl.VERTEX_SHADER
            };

            var shader = gl.createShader( types[type]);
            var line, lineNum, lineError, index = 0, indexEnd;

            gl.shaderSource( shader, [src] );
            gl.compileShader( shader );


            if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
                var error = gl.getShaderInfoLog( shader );

                console.error( [shader],error );

                while (index >= 0) {
                    index = error.indexOf("ERROR: 0:", index);
                    if (index < 0) { break; }
                    index += 9;
                    indexEnd = error.indexOf(':', index);
                    if (indexEnd > index) {
                        lineNum = parseInt(error.substring(index, indexEnd));
                        if ((!isNaN(lineNum)) && (lineNum > 0)) {
                            index = indexEnd + 1;
                            indexEnd = error.indexOf("ERROR: 0:", index);

                        }
                    }
                }
                return null;
            }

            okCount++;
            //    console.log("Shader OK:", okCount);
            return shader;
        }

        let buildStringChunks = function(src, data) {
            var chunks = {}
            for (var key in data) {
                chunks[key] = data[key].join( "\n" );
                PipelineAPI.setCategoryKeyValue(src, key, chunks[key]+"\n");
            }
            notifyShaderDataUpdate();
            //    console.log("CACHE STRING CHUNKS:", src, chunks);
        };

            let mapThreeShaderChunks = function() {
            var chunks = {}
            for (var key in THREE.ShaderChunk) {
                chunks[key] = THREE.ShaderChunk[key];
                PipelineAPI.setCategoryKeyValue("THREE_CHUNKS", key, "\n" + chunks[key] + "\n");
            }
            //    console.log("CACHE THREE CHUNKS:", chunks);
        };

            let combineProgramFromSources = function(sources) {
            var programString = '';
            for (var i = 0; i < sources.length; i++) {
                programString += PipelineAPI.readCachedConfigKey(sources[i].source, sources[i].chunk) + "\n";
            }
            return programString;
        };

            let buildShaderPrograms = function(src, data) {

            var program = {};
            var cached = PipelineAPI.readCachedConfigKey("SHADERS", src);

            var diff = 2;

            for (var key in data) {
                program[key] = combineProgramFromSources(data[key]);

                if (!diff) {
                    console.log("Shader not changed", src, key);
                    return;
                }

                if (!testShader(program[key], key)) {
                    console.log("Bad Shader", key, data);

                    if (cached[key] != program[key]) {
                        console.log("Broke Good Shader", src, key, [PipelineAPI.getCachedConfigs()], data);
                        return;
                    }

                    return;
                } else {
                    //                console.log("Shader Test success: ", src, key)
                }

                if (cached) {
                    if (cached[key] == program[key]) {
                        diff --;
                    }
                }

            }

            PipelineAPI.setCategoryKeyValue("SHADERS", src, program);
            //        console.log("CACHED SHADER PROGRAMS:", src, PipelineAPI.getCachedConfigs());
        };

            let buildShadersFromIndex = function() {
            for (var key in shaderDataIndex) {
                buildShaderPrograms(key, shaderDataIndex[key]);
            }
        };

            let registerShaderProgram = function(src, data) {
            shaderDataIndex[src] = {};
            for (var key in data) {
                shaderDataIndex[src][key] = data[key];
            }
            //    console.log("SHADER DATA INDEX:", shaderDataIndex);
            notifyShaderDataUpdate();
        };

            let notifyShaderDataUpdate = function() {
            clearTimeout(buildTimeout, 1);
            buildTimeout = setTimeout(function() {
                buildShadersFromIndex();
            }, 10);
        };

            let loadChunkIndex = function(src, data) {
            for (var i = 0; i < data.length; i++) {
                new PipelineObject("SHADER_CHUNKS",   data[i], buildStringChunks)
            }
        };

            let loadProgramIndex = function(src, data) {
            for (var i = 0; i < data.length; i++) {
                new PipelineObject("SHADER_PROGRAMS",   data[i], buildStringChunks)
            }
        };

            let loadShaderIndex = function(src, data) {
            for (var i = 0; i < data.length; i++) {
                new PipelineObject("SHADERS_THREE",   data[i], registerShaderProgram)
            }
        };

            let monkeyPatchStandardShaderForInstancing = function() {


            THREE.ShaderLib.lambert = { // this is a cut-and-paste of the lambert shader -- modified to accommodate instancing for this app
                uniforms: THREE.ShaderLib.lambert.uniforms,
                vertexShader:
                    `
				#define LAMBERT
				#ifdef INSTANCED
					attribute vec3 offset;
					attribute vec3 vertexColor;
					attribute vec3 scale3d;
					attribute vec4 orientation;
				#endif
				varying vec3 vLightFront;
				varying vec3 vIndirectFront;
				#ifdef DOUBLE_SIDED
					varying vec3 vLightBack;
					varying vec3 vIndirectBack;
				#endif
				#include <common>
				#include <uv_pars_vertex>
				#include <uv2_pars_vertex>
				#include <envmap_pars_vertex>
				#include <bsdfs>
				#include <lights_pars_begin>
				#include <color_pars_vertex>
				#include <fog_pars_vertex>
				#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>
				void main() {
					#include <uv_vertex>
					#include <uv2_vertex>
					#include <color_vertex>
					// vertex colors instanced
					#ifdef INSTANCED
						#ifdef USE_COLOR
							vColor.xyz = vertexColor.xyz;
						#endif
					#endif
					#include <beginnormal_vertex>
					#include <morphnormal_vertex>
					#include <skinbase_vertex>
					#include <skinnormal_vertex>
					#include <defaultnormal_vertex>
					#include <begin_vertex>
					// position instanced
					#ifdef INSTANCED

                        transformed *= 10.0;
						transformed = offset;
						
					#endif
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>
					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <worldpos_vertex>
					#include <envmap_vertex>
					#include <lights_lambert_vertex>
					#include <shadowmap_vertex>
					#include <fog_vertex>
				}
				`,

                fragmentShader: THREE.ShaderLib.lambert.fragmentShader

            };

            //    var attributes = ["offset", "vertexColor", "scale3d", "orientation"],

            THREE.ShaderLib.physical = { // this is a cut-and-paste of the physical shader -- modified to accommodate instancing for this app

                uniforms: THREE.ShaderLib.physical.uniforms,

                vertexShader :
                    `
                    #define PHYSICAL
                    
                    #ifdef INSTANCED
                    
					    attribute vec3 offset;
					    attribute vec3 vertexColor;
					    attribute vec3 scale3d;
					    attribute vec4 orientation;
					    
				    #endif
                    
                    varying vec3 vViewPosition;
                    
                    #ifndef FLAT_SHADED
                    	varying vec3 vNormal;
                    #endif
                    
                    #include <common>
                    #include <uv_pars_vertex>
                    #include <uv2_pars_vertex>
                    #include <displacementmap_pars_vertex>
                    #include <color_pars_vertex>
                    #include <fog_pars_vertex>
                    #include <morphtarget_pars_vertex>
                    #include <skinning_pars_vertex>
                    #include <shadowmap_pars_vertex>
                    #include <logdepthbuf_pars_vertex>
                    #include <clipping_planes_pars_vertex>
                    
                    void main() {
                    	#include <uv_vertex>
                    	#include <uv2_vertex>
                    	#include <color_vertex>
                    	#include <beginnormal_vertex>
                    	
                    	#ifdef INSTANCED
                               
                            vec3 nmV = cross(orientation.xyz, objectNormal);
                            objectNormal = nmV * (2.0 * orientation.w) + (cross(orientation.xyz, nmV) * 2.0 + objectNormal);
						   
					    #endif
                    	
                    	#include <morphnormal_vertex>
                    	#include <skinbase_vertex>
                    	#include <skinnormal_vertex>
                    	#include <defaultnormal_vertex>
                    	
                    	

                    	
                    	
                    	#ifndef FLAT_SHADED
                    		vNormal = normalize( transformedNormal );
                    	#endif
                    	#include <begin_vertex>
                    	
                    	#ifdef INSTANCED
                        
                            transformed.x *= 1.0 * scale3d.x;
                            transformed.y *= 1.0 * scale3d.y;
                            transformed.z *= 1.0 * scale3d.z;
                            
                                                   
                            transformed = transformed.xyz;
                            
                            vec3 vcV = cross(orientation.xyz, transformed);
                            transformed = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + transformed);

						    transformed += offset;
						    
					    #endif
                    	                   
                    	
                    	#include <morphtarget_vertex>
                    	#include <skinning_vertex>
                    	#include <displacementmap_vertex>
                    	#include <project_vertex>
                    	#include <logdepthbuf_vertex>
                    	#include <clipping_planes_vertex>
                    	vViewPosition = - mvPosition.xyz;
                    	#include <worldpos_vertex>
                    	#include <shadowmap_vertex>
                    	#include <fog_vertex>
                    }
				`,
                fragmentShader: THREE.ShaderLib.physical.fragmentShader
            };


        };


            gl = glContext;

            monkeyPatchStandardShaderForInstancing();
        //    console.log("Shader Lib: ", THREE.ShaderLib)

            mapThreeShaderChunks();

            new PipelineObject("SHADER_CHUNKS",   "LOAD_CHUNK_INDEX", loadChunkIndex);
            new PipelineObject("SHADER_PROGRAMS", "LOAD_PROGRAM_INDEX", loadProgramIndex);
            new PipelineObject("SHADERS_THREE",   "LOAD_SHADER_INDEX", loadShaderIndex);

        };

    }

export { ThreeShaderBuilder }