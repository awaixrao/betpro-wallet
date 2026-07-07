const express = require("express");
const {
  loginHandler,
  depositHandler,
  withdrawHandler,
  createUserHandler,
  checkBalanceHandler,
  ledgerHandler,
} = require("./betpro.controller");

const router = express.Router();

router.post("/login", loginHandler);
router.post("/deposit", depositHandler);
router.post("/withdraw", withdrawHandler);
router.post("/create-user", createUserHandler);
router.post("/balance", checkBalanceHandler);
router.post("/ledger", ledgerHandler);

module.exports = router;
