"use strict";


class EventParser {

    constructor() {

    }

/*
        animationEvent = [];
        attachmentPointEvent = [];
        key;
        i;
        animStates;
        modelEvent = [];
        obj3d;
        count;
        stride;
        spatial;

        parser = {};


        parser[ENUMS.Event.UPDATE_MODEL] = function(modelInstance, event) {
            obj3d = modelInstance.obj3d;

            spatial = modelInstance.getSpatial();
            spatial.setPosXYZ(   event[1],  event[2],  event[3]  );
            spatial.setQuatXYZW( event[4],  event[5],  event[6],  event[7] );
            spatial.setScaleXYZ( event[8],  event[9],  event[10] );


            if (modelInstance.active !== event[11]) {
                modelInstance.setActive(event[11]);
            }
        };

        readAnimation = function(modelInstance, index, animEvent) {
            modelInstance.updateAnimationState(
                animEvent[index+1],
                animEvent[index+2],
                animEvent[index+3],
                animEvent[index+4],
                animEvent[index+5],
                animEvent[index+6],
                animEvent[index+7],
                animEvent[index+8]
            )
        };

        animStride = 8;
        attachStride = 12;

        parser[ENUMS.Event.UPDATE_ANIMATIONS] = function(modelInstance, event) {
            count = event[1];
            stride = animStride;
            for (i = 0; i < count; i++) {
                readAnimation(modelInstance, stride*i+1, event);
            }
        };

        joint;
        itemPtr;

        readAttachment = function(modelInstance, index, event) {
            joint = event[index];

            itemPtr = event[index+11];

            let attachInstance = WorkerAPI.getDynamicMain().getInstanceByPointer(itemPtr);

            if (joint === ENUMS.Joints.SKIN) {
                console.log("Read SKIN Attachment");
                modelInstance.requestAttachment(attachInstance);
                return;
            }

            let dynJoint = modelInstance.getDynamicJoint(joint);

            obj3d = dynJoint.getOffsetObj3D();

            obj3d.position.set( event[index+1], event[index+2], event[index+3]);
            obj3d.quaternion.set( event[index+4], event[index+5], event[index+6], event[index+7]);
            obj3d.scale.set( event[index+8], event[index+9], event[index+10]);
        //    console.log("Parse ATTACH_TO_JOINT", [modelInstance], itemPtr, ENUMS.getKey('Joints', joint));
            modelInstance.requestAttachToJoint(attachInstance, dynJoint);
        };


        parser[ENUMS.Event.ATTACH_TO_JOINT] = function(modelInstance, event) {

            count = event[1];
            stride = attachStride;
            for (i = 0; i < count; i++) {
                readAttachment(modelInstance, stride*i+2, event);
            }

        };



        parseEntityEvent = function(modelInstance, event) {
            if (!parser[event[0]]) {
                console.log("Bad event: ", [modelInstance, event]);
                return;
            }
            parser[event[0]](modelInstance, event);
        };

        worldEntityEvent = function(worldEntity) {

            obj3d = worldEntity.obj3d;
            modelEvent[0]  = ENUMS.Event.UPDATE_MODEL;
            modelEvent[1]  = obj3d.position.x;
            modelEvent[2]  = obj3d.position.y;
            modelEvent[3]  = obj3d.position.z;
            modelEvent[4]  = obj3d.quaternion.x;
            modelEvent[5]  = obj3d.quaternion.y;
            modelEvent[6]  = obj3d.quaternion.z;
            modelEvent[7]  = obj3d.quaternion.w;
            modelEvent[8]  = obj3d.scale.x;
            modelEvent[9]  = obj3d.scale.y;
            modelEvent[10] = obj3d.scale.z;
            modelEvent[11] = worldEntity.active;
            return modelEvent;
        };

        addAnimation = function(animState, index, animEvent) {
            animEvent[1]++;
            animEvent[index+1] = ENUMS.Animations[animState.getAnimationKey()];
            animEvent[index+2] = animState.getAnimationWeight();
            animEvent[index+3] = animState.getAnimationTimeScale();
            animEvent[index+4] = animState.getAnimationFade();
            animEvent[index+5] = animState.getAnimationChannel();
            animEvent[index+6] = animState.getAnimationLoop();
            animEvent[index+7] = animState.getAnimationClamp();
            animEvent[index+8] = animState.getAnimationSync();
        };

        idx;
        EventParser.animationEvent = function(worldEntity) {
            animStates = worldEntity.animationStates;
            animationEvent[0] = ENUMS.Event.UPDATE_ANIMATIONS;
            animationEvent[1] = 0;
            stride = animStride;
            idx = 0;
            for (i = 0; i < animStates.length; i++) {
                if (animStates[i].isDirty) {
                    addAnimation(animStates[i], stride*idx+1, animationEvent);
                    animStates[i].isDirty = false;
                    idx++;
                }
            }

            return animationEvent;
        };


        attachedEntity;
        addAttachmentJoint = function(joint, index, attchEvent) {
            obj3d = joint.obj3d;
            attachedEntity = joint.attachedEntity;
            attchEvent[1]++;
            attchEvent[index+1]  = ENUMS.Joints[joint.key];

            if (attchEvent[index+1] === ENUMS.Joints.SKIN) {
                console.log("Make SKIN Att EVT")
            };

            attchEvent[index+2]  = obj3d.position.x;
            attchEvent[index+3]  = obj3d.position.y;
            attchEvent[index+4]  = obj3d.position.z;
            attchEvent[index+5]  = obj3d.quaternion.x;
            attchEvent[index+6]  = obj3d.quaternion.y;
            attchEvent[index+7]  = obj3d.quaternion.z;
            attchEvent[index+8]  = obj3d.quaternion.w;
            attchEvent[index+9]  = obj3d.scale.x;
            attchEvent[index+10] = obj3d.scale.y;
            attchEvent[index+11] = obj3d.scale.z;

            if (attachedEntity) {
                attchEvent[index+12] = attachedEntity.ptr;
            } else {
                attchEvent[index+12] = -1;
            }

        };


        attJoint;

        attachmentPointEvent = function(attachmentUpdates) {

            attachmentPointEvent[0] = ENUMS.Event.ATTACH_TO_JOINT;

            attachmentPointEvent[1] = 0;
            stride = attachStride;
            idx = 0;

            while (attachmentUpdates.length) {
                attJoint = attachmentUpdates.pop();
                addAttachmentJoint(attJoint, stride*idx+1, attachmentPointEvent);
                attJoint.isDirty = false;
                idx++;
            }

            return attachmentPointEvent;

        };
*/
    }

export { EventParser }