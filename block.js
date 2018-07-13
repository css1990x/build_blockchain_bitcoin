const SHA256 = require('sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount, isMiningTransaction = false){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.subtractionAmount = amount; 
        this.amount = isMiningTransaction? amount: amount * 0.9;
        this.tax = isMiningTransaction? 0: amount * 0.1; 
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash);
    }
}


class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
    }

    createGenesisBlock() {
        return new Block(Date.parse("2018-01-12"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);
        let reward = 0; 
        for (let i = 0; i < this.pendingTransactions.length; i++){
          if (!this.pendingTransactions[i].isMiningTransaction){
            reward += this.pendingTransactions[i].tax; 
          }
        }

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, reward, true)
        ];
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalance(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.subtractionAmount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let myChain = new Blockchain();
let Loyalty = 'Cliff'; 
let Customer = 'Joe';
let Merchant = 'Jon'; 


myChain.createTransaction(new Transaction(null, Customer, 1000, true));
myChain.createTransaction(new Transaction(Customer, Merchant, 100));
myChain.createTransaction(new Transaction(Customer, Merchant, 100));
myChain.createTransaction(new Transaction(Customer, Merchant, 100));

console.log('\n Starting the miner...');
myChain.minePendingTransactions(Loyalty);
myChain.minePendingTransactions(Loyalty);
console.log('Customer Balance is, ', myChain.getBalance(Customer));
console.log('Merchant Balance is, ', myChain.getBalance(Merchant));
console.log('Loyalty Balance is, ', myChain.getBalance(Loyalty));
let originalMerchantBalance = myChain.getBalance(Merchant); 
let originalLoyaltyBalance = myChain.getBalance(Loyalty);
console.log('original Merchant Balance ', originalMerchantBalance);
console.log('originalLoyaltyBalance, ', originalLoyaltyBalance);
myChain.createTransaction(new Transaction(Customer, Merchant, 100));
myChain.createTransaction(new Transaction(Customer, Merchant, 100));
myChain.minePendingTransactions(Loyalty);
myChain.minePendingTransactions(Loyalty);
console.log('Customer Balance is, ', myChain.getBalance(Customer)); 
console.log('Merchant Balance is ', myChain.getBalance(Merchant));
console.log('Loyalty Balance is, ', myChain.getBalance(Loyalty));

let merchantRefund = myChain.getBalance(Merchant) - originalMerchantBalance; 
let miningRefund = myChain.getBalance(Loyalty) - originalLoyaltyBalance; 
myChain.createTransaction(new Transaction(Merchant, Customer, merchantRefund, true));
myChain.createTransaction(new Transaction(Loyalty, Customer, miningRefund, true));
myChain.minePendingTransactions(Loyalty);
console.log('Customer balance is ', myChain.getBalance(Customer));
console.log('Merchant balance is ', myChain.getBalance(Merchant));
console.log('Loyalty balance is', myChain.getBalance(Loyalty));



