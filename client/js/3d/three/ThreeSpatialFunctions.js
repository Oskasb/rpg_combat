
class ThreeSpatialFunctions {
    constructor() {

        this.calcVec = new THREE.Vector3();
        this.calcVec2 = new THREE.Vector3();
        this.pointerFrustumPos = new THREE.Vector3();
        this.sizeFactor = 0.51;

    }

    getHoverDistanceToPos = function(pos, pointerPos) {

        let matchView = function(vec3) {
            vec3.x *= this.sizeFactor * client.gameScreen.getAspect();
            vec3.v *= this.sizeFactor;
            vec3.z = 0;
        }.bind(this);

        this.pointerFrustumPos.set(
            ((pointerPos.x-client.gameScreen.getLeft()) / client.gameScreen.getWidth() - 0.5) ,
            -((pointerPos.y-client.gameScreen.getTop()) / client.gameScreen.getHeight()- 0.5) ,
            0
        );

    //    evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:pos, color:'GREEN', size:1})

        matchView(pos);

        return pos.distanceToSquared(this.pointerFrustumPos);

    };

}

export { ThreeSpatialFunctions }