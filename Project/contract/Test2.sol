pragma solidity >0.4.23 <0.5.0;

contract Test2{
    
    enum Type{
        normal,
        bank
    }
    
    enum Status{
        valid,
        invalid
    }
    
    struct company{
        address companyAddress;
        string companyName;
        Type companyType ;
    }
    
    struct receipt{
        string fromName;
        string toName;
        address fromAddress;
        address toAddress;
        uint amount;
        uint endtime;
        Status receiptStatus;
    }
    
    address public BANK;
    
    mapping(address => company) public companys;
    mapping(address => receipt[]) public receipts;
    mapping(address => uint) public property;

    constructor (string bankName, uint balance) public{
        BANK=msg.sender;
        companys[msg.sender].companyAddress=msg.sender;
        companys[msg.sender].companyName=bankName;
        companys[msg.sender].companyType=Type.bank;
        property[msg.sender]=balance;
    }

    function join (address cAddress, string cName, Type cType, uint p) public{
        require(companys[msg.sender].companyType==Type.bank,"Only the bank has rights to do this!");
        address node=cAddress;
        companys[node].companyAddress=cAddress;
        companys[node].companyName=cName;
        companys[node].companyType=cType;
        property[node]=p;
    }
    
    
    function GoodsTrade (address cAddress, uint money,uint second) public returns(bool){
        address up=msg.sender;
        address down=cAddress;
        receipts[down].push(receipt({
            fromName: companys[up].companyName,
            toName: companys[down].companyName,
            fromAddress: companys[up].companyAddress,
            toAddress: companys[down].companyAddress,
            amount: money,
            endtime: now+second,
            receiptStatus: Status.valid
        }));
        return true;
    }
    
    function ReceiptTrade (address cAddress, uint money, uint rec) public returns (bool){
        require(rec<receipts[msg.sender].length,"The receipt doesn't exist!");
        require(receipts[msg.sender][rec].receiptStatus==Status.valid,"The receipt is invalid!");
        require(receipts[msg.sender][rec].amount>=money,"Transaction amount is greater than bill amount!");
        address f=msg.sender;
        address t=cAddress;
        receipts[t].push(receipt({
            fromName: receipts[f][rec].fromName,
            toName: companys[t].companyName,
            fromAddress: receipts[f][rec].fromAddress,
            toAddress: companys[t].companyAddress,
            amount: money,
            endtime: receipts[f][rec].endtime,
            receiptStatus: Status.valid
        }));
        receipts[f][rec].amount=receipts[f][rec].amount-money;
        return true;
    }
    
    function Financing (uint rec) public{
        require(companys[msg.sender].companyType!=Type.bank);
        require(rec<receipts[msg.sender].length,"The receipt doesn't exist!");
        require(receipts[msg.sender][rec].receiptStatus==Status.valid,"The receipt is invalid!");
        receipts[BANK].push(receipt({
            fromName: receipts[msg.sender][rec].fromName,
            toName: companys[BANK].companyName,
            fromAddress: receipts[msg.sender][rec].fromAddress,
            toAddress: companys[BANK].companyAddress,
            amount: receipts[msg.sender][rec].amount,
            endtime: receipts[msg.sender][rec].endtime,
            receiptStatus: Status.valid
        }));
        receipts[msg.sender][rec].receiptStatus=Status.invalid;
        transfer(BANK,msg.sender,receipts[msg.sender][rec].amount);
    }
    
    function SettleAccount() public {
        for(uint i=0;i<receipts[msg.sender].length;i++){
            require(receipts[msg.sender][i].endtime<now);
            if(receipts[msg.sender][i].receiptStatus==Status.valid && receipts[msg.sender][i].toAddress==msg.sender){
                transfer(receipts[msg.sender][i].fromAddress,msg.sender,receipts[msg.sender][i].amount);
                receipts[msg.sender][i].receiptStatus=Status.invalid;
            }
        }
    }
    
    function transfer(address fromAd, address toAd, uint amount) private{
        property[fromAd]=property[fromAd]-amount;
        property[toAd]=property[toAd]+amount;
    }
    
}