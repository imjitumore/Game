let tileCount = 7;
let tileHeight, tileWidth;
let tiles = [];
let tileSprites = [];

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    for (let i = 1; i <= 6; i++) {
      this.load.image(`bg${i}`, `./assets/BG_0${i}.${i === 3 || i === 5 ? 'png' : 'jpg'}`);
    }
    this.load.image("background", "./assets/start.jpg");
    this.load.image("back", "./assets/bk.jpg");
    this.load.image("startBtn", "./assets/startBtn.jpeg");
  }

  create() {
    this.selectedKey = "bg1"; // Default selection

    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, "background")
      .setOrigin(0.5)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Store image options
    this.thumbnails = [
      { key: "bg1", x: this.scale.width / 2 - 420, y: 100 },
      { key: "bg2", x: this.scale.width / 2, y: 100 },
      { key: "bg3", x: this.scale.width / 2 + 420, y: 100 },
      { key: "bg4", x: this.scale.width / 2 - 420, y: 370 },
      { key: "bg5", x: this.scale.width / 2, y: 370 },
      { key: "bg6", x: this.scale.width / 2 + 420, y: 370 }
    ];

    // Create all image thumbnails
    this.thumbnails.forEach((thumb) => {
      const image = this.add.image(thumb.x, thumb.y, thumb.key)
        .setOrigin(0.5, 0)
        .setDisplaySize(350, 200)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.selectedKey = thumb.key;
          updateTints();
        });

      thumb.image = image; // Save reference
    });

    // Function to update tints
    const updateTints = () => {
      this.thumbnails.forEach((thumb) => {
        if (thumb.key === this.selectedKey) {
          thumb.image.setTint(0xffff00); // yellow tint for selected
        } else {
          thumb.image.clearTint(); // no tint for others
        }
      });
    };

    // Initially tint the default selected image
    updateTints();

    // Add instruction text
    this.add.text(this.scale.width / 2, 20, "Choose Any Image And Start the Game.", {
      font: "35px bungee shade",
      fill: "red",
      fontStyle: 400,
    }).setOrigin(0.5, 0);

    // Start button
    const startButton = this.add.image(this.scale.width / 2, 670, "startBtn")
      .setOrigin(0.5)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true });

    startButton.on("pointerdown", () => {
    // Clean up any existing textures
    if (this.scene.get("puzzle")) {
        for (let i = 0; i < tileCount; i++) {
            this.textures.remove(`tile-${i}`);
        }
    }
    
    // Reset global arrays
    tileSprites = [];
    tiles = [];
    
    // Start new game
    const isFullscreen = document.fullscreenElement !== null;
    this.scene.start("puzzle", {
        selectedKey: this.selectedKey,
        fromFullscreen: isFullscreen
    });
});
  }
}

class FullscreenPrompt extends Phaser.Scene {
  constructor() {
    super({ key: "fullscreen" });
  }

  create() {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85).setOrigin(0);
    this.add.text(this.scale.width / 2,this.scale.height / 2 - 60,"Please enter fullscreen mode to continue.",{font: "24px Arial",fill: "#ffffff",align: "center",wordWrap: { width: this.scale.width - 100 }}).setOrigin(0.5);
    const okButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, "OK", {font: "28px Arial",fill: "#ffffff",backgroundColor: "#ff0000",padding: { x: 20, y: 10 },align: "center",}).setOrigin(0.5).setInteractive();
    
    okButton.on("pointerdown", () => {
      if (!document.fullscreenElement) {
        document.body.requestFullscreen().then(() => {
          this.scene.stop();
          this.scene.resume("puzzle");
          const puzzleScene = this.scene.get("puzzle");
          puzzleScene.isPausedDueToFullscreenExit = false;
          puzzleScene.fromFullscreen = true;
        }).catch((err) => {
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
    // Clean up any existing popups if restarting
    if (this.popupBg) {
      this.popupBg.destroy();
      this.timeUpText.destroy();
      this.tryAgainBtn.destroy();
    }

    tiles = [];
    tileSprites = [];
    this.selectedTiles = [];
    this.isPausedDueToFullscreenExit = false;

    this.timeLeft = 60; // Start from 60 seconds

    this.timerText = this.add.text(this.scale.width - 200, 20, "Time: 60", {
        fontSize: "24px",
        fontStyle: "bold",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: {x: 20,y: 15,},
      }).setDepth(100);

    this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
        this.timeLeft--;
        this.timerText.setText("Time: " + this.timeLeft);

        if (this.timeLeft <= 0) {
          this.timeEvent.remove(); // Stop timer
          this.timerText.setText("Time: 0");
          this.showTimeUpPopup(); // Show time's up popup
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
      ctx.drawImage(fullImage,i * srcTileWidth,0,srcTileWidth,fullImage.height,0,0,tileWidth,tileHeight);
      const tileKey = `tile-${i}`;
      this.textures.addCanvas(tileKey, canvas);
      tiles.push(tileKey);
    }

    Phaser.Utils.Array.Shuffle(tiles);

    const dropZones = [];
    for (let i = 0; i < tileCount; i++) {
      const zone = this.add.zone(i * tileWidth, 0, tileWidth, tileHeight).setOrigin(0, 0).setRectangleDropZone(tileWidth, tileHeight).setData("index", i);
      dropZones.push(zone);
    }

    for (let i = 0; i < tiles.length; i++) {
      const tile = this.add.image(i * tileWidth, 0, tiles[i]).setOrigin(0, 0).setInteractive({ draggable: true });

      tile.currentIndex = i;
      tile.correctKey = `tile-${i}`;
      tile.selected = false;

      tile.preFX.addColorMatrix().blackWhite();
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

    // Show Image button
    const showImageButton = this.add.text(10, 10, "Preview", {
        font: "20px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        align: "center",
      }).setInteractive().setDepth(1000);

    showImageButton.on("pointerdown", () => {
      this.showOriginalImage();
    });

    // Only launch fullscreen prompt if not already in fullscreen
    if (!this.fromFullscreen) {
      this.scene.launch("fullscreen");
    }

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && !this.scene.isPaused("fullscreen")) {
        this.isPausedDueToFullscreenExit = true;
        this.scene.launch("fullscreen");
        this.scene.pause();
      }
    });
  }

  showTimeUpPopup() {
    // Pause the timer and any other game elements that should stop
    this.timeEvent.remove();
    
    // Create semi-transparent overlay
    this.popupBg = this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        400,
        200,
        0x000000,
        0.7
    ).setDepth(200).setInteractive();

    // "Time's up!" text
    this.timeUpText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 - 40,
        "Time's up!",
        {
            fontSize: "32px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center",
        }
    ).setOrigin(0.5).setDepth(201);

    // Try Again button
    this.tryAgainBtn = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 + 20,
        "Try Again",
        {
            fontSize: "24px",
            backgroundColor: "#ffffff",
            color: "#000000",
            padding: { x: 15, y: 8 },
            fontStyle: "bold",
        }
    )
    .setOrigin(0.5)
    .setDepth(201)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        this.popupBg.destroy();
        this.timeUpText.destroy();
        this.tryAgainBtn.destroy();
        this.scene.restart({ 
            selectedKey: this.selectedKey,
            fromFullscreen: document.fullscreenElement !== null
        });
    });

    tileSprites.forEach(tile => {
        tile.disableInteractive();
    });

    this.tweens.pauseAll();
  }

  pauseGame() {
    this.isPausedDueToResize = true;
    this.scene.pause();

    this.pauseText = this.add
      .text(
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
      )
      .setOrigin(0.5)
      .setDepth(100);

    this.okButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 60, "OK", {
        font: "28px Arial",
        fill: "#ffffff",
        backgroundColor: "#00bfff",
        padding: { x: 20, y: 10 },
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    this.okButton.on("pointerdown", () => {
      this.handleResize();
    });
  }

  resumeGame() {
    this.isPausedDueToResize = false;
    this.pauseText.destroy();
    this.okButton.destroy();
    this.scene.resume();
  }

  swapTiles(tile1, tile2) {
    const tempIndex = tile1.currentIndex;
    tile1.currentIndex = tile2.currentIndex;
    tile2.currentIndex = tempIndex;

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

  checkWin() {
    const allCorrect = tileSprites.every(
      (tile) => tile.texture.key === `tile-${tile.currentIndex}`
    );
    if (allCorrect) {
      tileSprites.forEach((tile) => tile.clearFX());
      this.askQuestion();
    }
  }

  askQuestion() {
  
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

    this.add
      .text(this.scale.width / 2, 25, question, {
        font: "32px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
        align: "center",
      })
      .setOrigin(0.5, 0);

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

  submitAnswer() {
    if (this.selectedTiles.length === 0) {
      this.showMessage("Please select at least one tile!", "#ff0000");
      return;
    }

    let correctTiles = [];
    if (this.selectedKey === "bg1") correctTiles = [5];
    else if (this.selectedKey === "bg2") correctTiles = [4, 5];
    else if (this.selectedKey === "bg3") correctTiles = [2, 3, 4];
    else if (this.selectedKey === "bg4") correctTiles = [2, 4];
    else if (this.selectedKey === "bg5") correctTiles = [1];
    else if (this.selectedKey === "bg6") correctTiles = [5];

    const isCorrect =
      this.selectedTiles.length === correctTiles.length &&
      this.selectedTiles.every((tile) => correctTiles.includes(tile));

    if (isCorrect) {
      this.showMessage("Correct! You Win!", "#00ff00");
      // this.timerText.destroy()
      setTimeout(() => this.showBackButton(), 1500);
    } else {
      this.showMessage("Wrong! Please Try Again....!", "#ff0000");
    }
  }

  showBackButton() {
    this.add.image(this.scale.width / 2, this.scale.height / 2, "back")
        .setOrigin(0.5)
        .setDisplaySize(100, 100)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
            // Remove all tile textures from cache
            for (let i = 0; i < tileCount; i++) {
                this.textures.remove(`tile-${i}`);
            }
            
            // Clear global arrays
            tileSprites = [];
            tiles = [];
            
            // Stop current scene and start BootScene
            this.scene.stop();
            this.scene.start("BootScene");
        });
}

  showOriginalImage() {
    tileSprites.forEach((tile) => tile.disableInteractive());

    const imageWidth = this.scale.width * 0.6;
    const imageHeight = this.scale.height * 0.6;
    const overlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(10)
      .setInteractive();
    const preview = this.add
      .image(this.scale.width / 2, this.scale.height / 2, this.selectedKey)
      .setDisplaySize(imageWidth, imageHeight)
      .setOrigin(0.5)
      .setDepth(1001);
    const closeX = preview.x + imageWidth / 2 - 20;
    const closeY = preview.y - imageHeight / 2 + 20;

    const closeButton = this.add
      .text(closeX, closeY, "X", {
        font: "28px Arial",
        fill: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(10000)
      .setInteractive();

    this.children.bringToTop(closeButton);

    closeButton.on("pointerdown", () => {
      overlay.destroy();
      preview.destroy();
      closeButton.destroy();

      tileSprites.forEach((tile) => tile.setInteractive({ draggable: true }));
    });
  }
}
