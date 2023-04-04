class CharacterMovement {
    constructor(gamePiece) {
        this.vel = new THREE.Vector3();
        this.speed = 0;
        this.combatState = false;
        this.gamePiece = gamePiece;
        this.spatial = gamePiece.getSpatial();
        this.status = gamePiece.pieceState.status;
        this.frameSpeed = 0;
        this.charState = null;

        let onGameTick = function(tpf) {
            this.tickCharMovement(tpf)
        }.bind(this)

        this.callbacks = {
            onGameTick:onGameTick
        }

        GameAPI.registerGameUpdateCallback(this.callbacks.onGameTick);
    }

    applyCombatState(bool) {

        if (bool) {
            if (this.speed) {
                this.gamePiece.applyPieceAnimationState('WALK_COMBAT')
            } else {
             //   this.gamePiece.applyPieceAnimationState('SET_RT_FF')
                this.gamePiece.applyPieceAnimationState('GD_RT_FF')
            }
        } else {
            if (this.speed) {
                this.gamePiece.applyPieceAnimationState('WALK') // WALK_BODY
                this.gamePiece.applyPieceAnimationState('GD_BCK_R')
            } else {
                //   this.gamePiece.applyPieceAnimationState('SET_RT_FF')
                this.gamePiece.applyPieceAnimationState('IDLE')
                this.gamePiece.applyPieceAnimationState('GD_BCK_R')
            }
        }


    }

    applyMovementState(bool) {
        if (bool) {

            ThreeAPI.tempObj.quaternion.set(0, 1, 0,0)

            let angY = MATH.vectorXZToAngleAxisY(this.vel);
            ThreeAPI.tempObj.rotateY(angY);
            this.spatial.obj3d.quaternion.copy(ThreeAPI.tempObj.quaternion)
            if (!this.combatState) {
                this.gamePiece.applyPieceAnimationState('WALK')
                this.gamePiece.applyPieceAnimationState('GD_BCK_R')
            } else {
                this.gamePiece.applyPieceAnimationState('WALK_COMBAT')
            }

        } else {
            if (!this.combatState) {
                this.gamePiece.applyPieceAnimationState('IDLE')
                this.gamePiece.applyPieceAnimationState('GD_BCK_R')
            } else {
                this.gamePiece.applyPieceAnimationState('GD_RT_FF')
            }

        }

    }

    updateCharMovement(tpf) {

        if (this.charState !== this.status.charState) {
            if (this.status.charState !== ENUMS.CharacterState.IDLE) {
                if (!this.combatState) {
                    this.applyCombatState(true);
                }
                this.combatState = true;
            } else {
                if (this.combatState) {
                    this.applyCombatState(false);
                }
                this.combatState = false;
            }
        }

        this.spatial.call.getMovement(this.vel)
        let speed = this.vel.lengthSq();
        if (speed) {
            this.applyMovementState(true)
        } else  {
            this.applyMovementState(false)
        }
        this.speed = speed;

    }

    tickCharMovement(tpf) {
        this.updateCharMovement(tpf)
    }

}

export { CharacterMovement }