"use strict";

define([
        'workers/WorkerData',
        'client/js/workers/main/game/actions/Action',
        'client/js/workers/main/game/actions/ActionPointStatus',
        'game/actions/ActionSlots',
        'game/combat/CharacterCombat',
        'game/control/CharacterMovement',
        'game/control/SimpleCharacterAI',
        'game/pieces/PieceAnimator',
        'game/pieces/PieceAttacher',
        'game/actors/Character',
        'game/actors/Item',
        'game/equipment/EquipmentSlots',
        'game/GamePiece'
    ],
    function(
        WorkerData,
        Action,
        ActionPointStatus,
        ActionSlots,
        CharacterCombat,
        CharacterMovement,
        SimpleCharacterAI,
        PieceAnimator,
        PieceAttacher,
        Character,
        Item,
        EquipmentSlots,
        GamePiece
    ) {

        var count = 0;

        var PieceBuilder = function() {

        };

        var loadPiece = function(dataId, onReady) {

            var pieceId = 'piece_'+count+'_'+dataId;

            var piece = new GamePiece(dataId);

            piece.initGamePiece(pieceId, new WorkerData("GAME", "PIECES"), new WorkerData("GAME", "SKELETON_RIGS"));

            var setupGamePiece = function(piece, onReady) {

                GuiAPI.printDebugText("SETUP GAME PIECE "+piece.readConfigData("model_asset"));

                var modelAssetId = piece.readConfigData('model_asset');

                var worldEntityReady = function(worldEntity) {
            //        console.log("ENT RDY", worldEntity)
                    piece.setWorldEntity(worldEntity);
                    configureEntityPiece(piece, onReady)
                };

                GameAPI.requestAssetWorldEntity(modelAssetId, worldEntityReady)

            };

            var configureEntityPiece = function(piece, onReady) {

                var pieceAttacher = new PieceAttacher();

                pieceAttacher.initPieceAttacher(piece);

                var pieceAnimator = new PieceAnimator();

                var animatorReady = function(pa) {
                    onReady(pa.gamePiece);
                };

                pieceAnimator.initPieceAnimator(piece, animatorReady);

            };

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    setupGamePiece(piece, onReady);
                }
            };

            piece.workerData.fetchData(piece.dataId, onDataReady);
        };

        PieceBuilder.prototype.attachAiToCharacter = function( character, fIdx) {
            let simpleAi = new SimpleCharacterAI();
            simpleAi.setFormationIndex(fIdx);
            character.addUpdateCallback(simpleAi.getUpdateCallback());
        };


        PieceBuilder.prototype.buildGamePiece = function( dataId, onReady) {
            count++;
            loadPiece(dataId, onReady);
        };


        PieceBuilder.prototype.buildCombatAction = function( dataId, onReady) {
            var action = new Action();
            action.initAction(dataId, new WorkerData("GAME", "COMBAT_ACTIONS"), onReady)
        };


        PieceBuilder.prototype.buildCharacter = function( dataId, onReady) {

            var onDataReady = function(char) {

                var pieceReady = function(gamePiece) {

                    char.setGamePiece(gamePiece);

                    onReady(char);
                    char.getCharacterMovement().attachMovementSphere(gamePiece.getWorldEntity());
                };


                var charMovementReady = function(charMovement) {

                    char.setCharacterMovement(charMovement);
                    GameAPI.createGamePiece(char.readConfigData('game_piece'), pieceReady);
                };

                var actionPointsReady = function(actionPoints) {

                    char.getCharacterCombat().setActiontPoints(actionPoints);
                    new CharacterMovement().initCharacterMovement(char.readConfigData('control_movement'), new WorkerData("GAME", "CONTROL_MOVEMENT"), charMovementReady);
                };

                var eqSlotsReady = function(eqSlots) {
                    char.setEquipmentSlots(eqSlots);
                    new ActionPointStatus().initActionPointStatus(char.readConfigData('action_points'), new WorkerData("GAME", "ACTION_POINTS"), actionPointsReady);
                };

                var actionSlotsReady = function(actionSlots) {
                    char.getCharacterCombat().setActiontSlots(actionSlots);
                    new EquipmentSlots().initEquipmentSlots(char.readConfigData('equip_slots'), new WorkerData("GAME", "EQUIP_SLOTS"), eqSlotsReady);
                };



                var actionSlots = new ActionSlots();
                var actionSlotsDataId = char.readConfigData('action_slots');

                actionSlots.initActionSlots(actionSlotsDataId, new WorkerData("GAME", "ACTION_SLOTS"), actionSlotsReady)

            };

            var char = new Character();
            char.setCharacterCombat(new CharacterCombat());
            char.initCharacter(dataId, new WorkerData("GAME", "CHARACTERS"), onDataReady)

        };


        PieceBuilder.prototype.buildItem = function( dataId, onReady) {

            var item = new Item();
            item.initItem(dataId, new WorkerData("GAME", "GAME_ITEMS"), onReady)

        };



        PieceBuilder.prototype.attachCharacterGui = function( character ) {

            GuiAPI.attachGuiToActor(character);
            character.getActorGui().activateActorGui();

        };

        return PieceBuilder;

    });

