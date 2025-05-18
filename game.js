let tileCount = 7; // count of tiles
let tileHeight, tileWidth;
let tiles = []; // for store texture keys
let tileSprites = [];

class AssetsLoad extends Phaser.Scene {
  constructor() {
    super({ key: "AssetsLoad" });
  }

  preload() {
    // Load all images for game
    this.load.image("bg1", "/assets/BG_01.jpg");
    this.load.image("bg2", "/assets/BG_02.jpg");
    this.load.image("bg3", "/assets/BG_03.png");
    this.load.image("bg4", "/assets/BG_04.jpg");
    this.load.image("bg5", "/assets/BG_05.png");
    this.load.image("bg6", "/assets/BG_06.jpg");
    this.load.image("background", "./assets/start.jpg");
    this.load.image("back", "./assets/bk.jpg");
    this.load.image("startBtn", "./assets/startBtn.png");
  }

  create() {
    this.selectedKey = "bg1"; //Set  default image

    //Bg image
    const bg = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "background")
      .setOrigin(0.5)
      .setDisplaySize(this.scale.width, this.scale.height);

    //
    const bg1 = this.add
      .image(this.scale.width / 2 - 420, 100, "bg1")
      .setOrigin(0.5, 0)
      .setDisplaySize(350, 200)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedKey = "bg1";
        this.updateSelection(); // This function use for add or remove color layer above th selected image
      });

    const bg2 = this.add
      .image(this.scale.width / 2, 100, "bg2")
      .setOrigin(0.5, 0)
      .setDisplaySize(350, 200)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedKey = "bg2";
        this.updateSelection();
      });

    const bg3 = this.add
      .image(this.scale.width / 2 + 420, 100, "bg3")
      .setOrigin(0.5, 0)
      .setDisplaySize(350, 200)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedKey = "bg3";
        this.updateSelection();
      });

    const bg4 = this.add
      .image(this.scale.width / 2 - 420, 330, "bg4")
      .setOrigin(0.5, 0)
      .setDisplaySize(350, 200)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedKey = "bg4";
        this.updateSelection();
      });

    const bg5 = this.add
      .image(this.scale.width / 2, 330, "bg5")
      .setOrigin(0.5, 0)
      .setDisplaySize(350, 200)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedKey = "bg5";
        this.updateSelection();
      });

    const bg6 = this.add
      .image(this.scale.width / 2 + 420, 330, "bg6")
      .setOrigin(0.5, 0)
      .setDisplaySize(350, 200)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedKey = "bg6";
        this.updateSelection();
      });

    // Store references for selection highlighting
    this.selectableImages = [
      { image: bg1, key: "bg1" },
      { image: bg2, key: "bg2" },
      { image: bg3, key: "bg3" },
      { image: bg4, key: "bg4" },
      { image: bg5, key: "bg5" },
      { image: bg6, key: "bg6" },
    ];

    this.updateSelection(); // Add layer on selected image 

    this.add.text(this.scale.width / 2, 20, "Choose Any Image And Start the Game.", {
        font: "35px bungee shade",
        fill: "red",
        fontStyle: 400,
      })
      .setOrigin(0.5, 0);

   
    const startButton = this.add // Play button game start from here
      .image(this.scale.width / 2, 620, "startBtn")
      .setOrigin(0.5)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        for (let i = 0; i < tileCount; i++) {
          if (this.textures.exists(`tile-${i}`)) {
            this.textures.remove(`tile-${i}`);
          }
        }

        this.scene.start("puzzle", {
          selectedKey: this.selectedKey, // pass references selected image to puzzle class
          fromFullscreen: document.fullscreenElement !== null, // its check is game in fullscreen mode or not 
        });
      });
  }

  updateSelection() { // This function used to add color layer for selected image Using tint
    this.selectableImages.forEach((item) => {
      item.image.setTint(item.key === this.selectedKey ? 0xffff00 : 0xffffff);
    });
  }
}





class FullscreenPrompt extends Phaser.Scene { //This class used to indicate game in fullscreen mode or not
  constructor() {
    super({ key: "fullscreen" });
  }

  create() {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);
    this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 - 60,
        "Please enter fullscreen mode to continue.",
        {
          font: "24px Arial",
          fill: "#ffffff",
          align: "center",
          wordWrap: { width: this.scale.width - 100 },
        }).setOrigin(0.5);

    // After click on this button game take a fullscreen 
    const okButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, "OK", {
        font: "28px Arial",
        fill: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 20, y: 10 },
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive();

    okButton.on("pointerdown", () => {
      if (!document.fullscreenElement) {
        document.body
          .requestFullscreen()
          .then(() => {
            this.scene.stop();
            this.scene.resume("puzzle");
            const puzzleScene = this.scene.get("puzzle");
            puzzleScene.isPausedDueToFullscreenExit = false;
            puzzleScene.fromFullscreen = true;
          })
          .catch((err) => {
            console.error("Error enabling fullscreen:", err);
          });
      } else {
        this.scene.stop();
        this.scene.resume("puzzle");
        const puzzleScene = this.scene.get("puzzle");
        puzzleScene.isPausedDueToFullscreenExit = false;
        puzzleScene.fromFullscreen = true;
      }
    });
  }
}




class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: "puzzle" });
    this.selectedTiles = [];
    this.originalWidth = 0;
    this.originalHeight = 0;
    this.isPausedDueToResize = false;
  }

  init(data) {
    this.selectedKey = data.selectedKey;
    this.fromFullscreen = data.fromFullscreen || false;
  }

  create() {
    if (this.popupBg) {
      this.popupBg.destroy();
      this.timeUpText.destroy();
      this.tryAgainBtn.destroy();
    }

    tiles = [];
    tileSprites = [];
    this.selectedTiles = [];
    this.isPausedDueToFullscreenExit = false;

    this.timeLeft = 60; // Declare the time period of game 

    this.timerText = this.add.text(this.scale.width - 200, 20, "Time: 60", {
        fontSize: "24px",
        fontStyle: "bold",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 20, y: 15 },
      })
      .setDepth(100);

    this.timeEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText("Time: " + this.timeLeft);

        if (this.timeLeft <= 0) {
          this.timeEvent.remove(); // Stop timer
          this.timerText.setText("Time: 0");
          this.showTimeUpPopup(); // Show times up message 
        }
      },
      callbackScope: this,
      loop: true,
    });

    const fullImage = this.textures.get(this.selectedKey).getSourceImage();
    tileWidth = this.sys.game.config.width / tileCount;
    tileHeight = this.sys.game.config.height;

    for (let i = 0; i < tileCount; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = tileWidth;
      canvas.height = tileHeight;
      const ctx = canvas.getContext("2d");
      const srcTileWidth = fullImage.width / tileCount;
      ctx.drawImage(fullImage,
        i * srcTileWidth,
        0,
        srcTileWidth,
        fullImage.height,
        0,
        0,
        tileWidth,
        tileHeight
      );
      const tileKey = `tile-${i}`;
      this.textures.addCanvas(tileKey, canvas);
      tiles.push(tileKey);
    }

    Phaser.Utils.Array.Shuffle(tiles); // Used to Shuffle tiles

    const dropZones = [];
    for (let i = 0; i < tileCount; i++) {
      const zone = this.add
        .zone(i * tileWidth, 0, tileWidth, tileHeight).setOrigin(0, 0)
        .setRectangleDropZone(tileWidth, tileHeight).setData("index", i);

      dropZones.push(zone);
    }

    for (let i = 0; i < tiles.length; i++) {
      const tile = this.add
        .image(i * tileWidth, 0, tiles[i])
        .setOrigin(0, 0)
        .setInteractive({ draggable: true });

      tile.currentIndex = i;
      tile.correctKey = `tile-${i}`;
      tile.selected = false;

      tile.preFX.addColorMatrix().blackWhite(); // make all tiles colorless
      tileSprites.push(tile);
    }

    this.input.on("drag", (pointer, gameObject, dragX) => {
      if (!this.isPausedDueToFullscreenExit) {
        gameObject.x = dragX;
      }
    });

    this.input.on("dragend", (pointer, gameObject, dropped) => {
      if (!this.isPausedDueToFullscreenExit && !dropped) {
        gameObject.x = gameObject.currentIndex * tileWidth;
        gameObject.y = 0;
      }
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      if (!this.isPausedDueToFullscreenExit) {
        const targetIndex = dropZone.getData("index");
        const draggedTile = gameObject;
        const targetTile = tileSprites.find(
          (tile) => tile.currentIndex === targetIndex
        );
        if (targetTile) this.swapTiles(draggedTile, targetTile);
      }
    });

    // Preview button 
    const showImageButton = this.add
      .text(10, 10, "Preview", {
        font: "20px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        align: "center",
      })
      .setInteractive()
      .setDepth(1000);

    showImageButton.on("pointerdown", () => {
      this.showOriginalImage();
    });

    // Only launch fullscreen message if not already in fullscreen
    if (!this.fromFullscreen) {
      this.scene.launch("fullscreen");
    }

    // If player start the game and if not in fullscreen then it will be show fullscreen msg
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && !this.scene.isPaused("fullscreen")) {
        this.isPausedDueToFullscreenExit = true;
        this.scene.launch("fullscreen");
        this.scene.pause();
      }
    });
  }

  // If player not able to complete the game given time then it will be show try again 
  // and game restart with same selected image
  showTimeUpPopup() {
    this.timeEvent.remove();

    this.popupBg = this.add.rectangle(this.scale.width / 2,this.scale.height / 2,400,200,0x000000,0.7)
    .setDepth(200).setInteractive();

    this.timeUpText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, "Time's up!", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
      }).setOrigin(0.5).setDepth(201);

    this.tryAgainBtn = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, "Try Again", {
        fontSize: "24px",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: { x: 15, y: 8 },
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.popupBg.destroy();
        this.timeUpText.destroy();
        this.tryAgainBtn.destroy();
        this.scene.restart({
          selectedKey: this.selectedKey,
          fromFullscreen: document.fullscreenElement !== null,
        });
      });

    tileSprites.forEach((tile) => {
      tile.disableInteractive();
    });

    this.tweens.pauseAll();
  }

  // if Player not in fullscreen mode then it will be show plz move in fullscreen mode 
  pauseGame() {
    this.isPausedDueToResize = true;
    this.scene.pause();

    this.pauseText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        "Please maximize the window to continue.",
        {
          font: "24px Arial",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 20, y: 20 },
          align: "center",
        }
      ).setOrigin(0.5).setDepth(100);

    this.okButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 60, "OK", {
        font: "28px Arial",
        fill: "#ffffff",
        backgroundColor: "#00bfff",
        padding: { x: 20, y: 10 },
        align: "center",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);

    this.okButton.on("pointerdown", () => {
      this.handleResize();
    });
  }

  // Here Resume the game and player can restart to play game where it were paused
  resumeGame() {
    this.isPausedDueToResize = false;
    this.pauseText.destroy();
    this.okButton.destroy();
    this.scene.resume();
  }

  // This is function used to swap the 2 tiles from source to target
  swapTiles(tile1, tile2) {
    const tempIndex = tile1.currentIndex;
    tile1.currentIndex = tile2.currentIndex;
    tile2.currentIndex = tempIndex;

    // This is used to smooth animation during the swapping tiles
    this.tweens.add({
      targets: tile1,
      x: tile1.currentIndex * tileWidth,
      y: 0,
      duration: 200,
      ease: "Power2",
    });

    this.tweens.add({
      targets: tile2,
      x: tile2.currentIndex * tileWidth,
      y: 0,
      duration: 200,
      ease: "Power2",
    });

    this.checkWin();
  }


  // If player match the tile properly then tiles take their previous color ,
  // Remove the blackWhite color from tiles
  checkWin() {
    const allCorrect = tileSprites.every(
      (tile) => tile.texture.key === `tile-${tile.currentIndex}`
    );
    if (allCorrect) {
      tileSprites.forEach((tile) => tile.clearFX());
      this.askQuestion();
    }
  }

  // After arrange the all tile of image properly then ask the question to player
  askQuestion() {
    // there is is specific question for each image 
    let question = "";
    if (this.selectedKey === "bg1")
      question = "Where is the bucket in the image?";
    else if (this.selectedKey === "bg2")
      question = "Where is the dummy in the image?";
    else if (this.selectedKey === "bg3")
      question = "Where is the board in the image?";
    else if (this.selectedKey === "bg4")
      question = "Where is the single speaker in the image?";
    else if (this.selectedKey === "bg5")
      question = "Where are the plates in the image?";
    else if (this.selectedKey === "bg6")
      question = "Where is the basketball in the image?";

    this.add.text(this.scale.width / 2, 25, question, {
        font: "32px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
        align: "center",
      }).setOrigin(0.5, 0);

    tileSprites.forEach((tile) => {
      tile.setInteractive();
      tile.on("pointerdown", () => {
        tile.selected = !tile.selected;
        if (tile.selected) {
          tile.setTint(0xffff00);
          this.selectedTiles.push(tile.currentIndex);
        } else {
          tile.clearTint();
          this.selectedTiles = this.selectedTiles.filter(
            (index) => index !== tile.currentIndex
          );
        }
      });
    });

    const submitButton = this.add
      .text(this.scale.width / 2, this.scale.height - 50, "Submit", {
        font: "32px Arial",
        fill: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 20, y: 10 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setInteractive();

    submitButton.on("pointerdown", () => {
      this.submitAnswer();
    });
  }

  // Show the messgae like correct you win or Try again
  showMessage(text, color) {
    const message = this.add
      .text(this.scale.width / 2, this.scale.height / 3, text, {
        font: "28px Arial",
        fill: "#ffffff",
        backgroundColor: color,
        padding: { x: 15, y: 10 },
        align: "center",
      })
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => message.destroy());
  }

  // Submit the answer to verify to player can win or not
  submitAnswer() {
    if (this.selectedTiles.length === 0) {
      this.showMessage("Please select at least one tile!", "#ff0000");
      return;
    }

    let correctTiles = [];
    // This is the answer key for perticular image
    if (this.selectedKey === "bg1") correctTiles = [5];
    else if (this.selectedKey === "bg2") correctTiles = [4, 5];
    else if (this.selectedKey === "bg3") correctTiles = [2, 3, 4];
    else if (this.selectedKey === "bg4") correctTiles = [2, 4];
    else if (this.selectedKey === "bg5") correctTiles = [1];
    else if (this.selectedKey === "bg6") correctTiles = [5];

    const isCorrect =
      this.selectedTiles.length === correctTiles.length &&
      this.selectedTiles.every((tile) => correctTiles.includes(tile));

    // If all selected tiles match with answer key then show win otherwise try again...
    if (isCorrect) {
      this.showMessage("Correct! You Win!", "#00ff00");
      setTimeout(() => this.showBackButton(), 1500);
    } else {
      this.showMessage("Wrong! Please Try Again....!", "#ff0000");
    }
  }

  // Remove all tile textures , stop current scene and restart the game navigate to AssetsLoad
  showBackButton() {
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "back")
      .setOrigin(0.5)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        for (let i = 0; i < tileCount; i++) {
          this.textures.remove(`tile-${i}`);
        }

        tileSprites = [];
        tiles = [];

        this.scene.stop();
        this.scene.start("AssetsLoad");
      });
  }


  // Add overlay on game then  show original image and set cross button to exit this functionlity.
  showOriginalImage() {
    tileSprites.forEach((tile) => tile.disableInteractive());

    const imageWidth = this.scale.width * 0.6;
    const imageHeight = this.scale.height * 0.6;

    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0).setDepth(10).setInteractive();

    const preview = this.add.image(this.scale.width / 2, this.scale.height / 2, this.selectedKey)
      .setDisplaySize(imageWidth, imageHeight).setOrigin(0.5).setDepth(1001);
    const closeX = preview.x + imageWidth / 2 - 20;
    const closeY = preview.y - imageHeight / 2 + 20;

    const closeButton = this.add.text(closeX, closeY, "X", {
      font: "28px Arial",
      fill: "#ffffff",
      backgroundColor: "#ff0000",
      padding: { x: 10, y: 5 },}).setOrigin(0.5).setDepth(10000).setInteractive();

    this.children.bringToTop(closeButton);

    closeButton.on("pointerdown", () => {
      overlay.destroy();
      preview.destroy();
      closeButton.destroy();

      tileSprites.forEach((tile) => tile.setInteractive({ draggable: true }));
    });
  }
}
