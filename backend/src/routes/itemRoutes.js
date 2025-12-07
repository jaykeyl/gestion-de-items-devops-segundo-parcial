const express = require("express");
const ItemController = require("../controllers/itemController");

const router = express.Router();

router.get("/items", ItemController.getAll);
router.get("/items/:id", ItemController.getById);
router.post("/items", ItemController.create);
router.put("/items/:id", ItemController.update);
router.delete("/items/:id", ItemController.delete);

module.exports = router;
