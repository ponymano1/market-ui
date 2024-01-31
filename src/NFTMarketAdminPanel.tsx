
import { useState, useEffect } from 'react'
import { ethers, formatUnits } from "ethers";
import nftMarketAbi from "./abis/nftmarketV2abi.json"
import erc20TokenAbi from "./abis/erc20TokenAbi.json"
import {getSigner} from './ethUtil'

function NFTMarketAdminPanel({NFTMarketAddr, ERC20Arr}:{NFTMarketAddr:string, ERC20Arr:string}) {
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [walletAddr,setWalletAddr] = useState<string>("0x0");

    const [permitAddr, setPermitAddr] = useState<string>("0x0");
    const [tokenId, setTokenId] = useState<string>("0");

    const [sigStr,setSigStr] = useState<string>("0x0");
    const [deadline,setDeadline] = useState<number>(0);


    const [tokenIdCheck, setTokenIdCheck] = useState<string>("0");
    const [permitAddrCheck, setPermitAddrCheck] = useState<string>("0");
    const [deadlineCheck,setDeadlineCheck] = useState<number>(0);
    const [sigStrCheck,setSigStrCheck] = useState<string>("0x0");

    
    useEffect(() => {  
     handleConnect();
        
    }
    ,[])

    const handleConnect = async()  => {
        let signerObj = await getSigner();
        setSigner(signerObj);  
        if (signerObj == null) {
            console.log("signerObj is null");
            return;
        }
        let contractObj = new ethers.Contract(NFTMarketAddr, nftMarketAbi, signerObj);
        setContract(contractObj);
        setWalletAddr(await signerObj.getAddress());
    }

    const handleClickSig = async () => {
        let {signedData, deadline} = await computeSignature(tokenId, permitAddr);
        setSigStr(signedData);
        setDeadline(deadline);
    }

    const computeSignature = async (tokenId : string, permitAddr : string) : {string, number} => {
        console.log(`computeSignature tokenId: ${tokenId}, permitAddr: ${permitAddr}`);
        let name =  contract?.name();//这个name是部署时712的name
        let version =  contract?.version();
        console.log("name:"+name + ", version:" + version);
        
        let chainId = (await signer?.provider?.getNetwork()).chainId
        let contractAddr = await contract?.getAddress();
        console.log(`setSignature: name: ${name}, chainId: ${chainId}, contractAddr: ${contractAddr}, tokenId: ${tokenId}, permitAddr: ${permitAddr}`);
        
        const domain = {
            name: name, //这个name是部署时712的name
            version: version, //这个name是部署时712的version,都是通过构造函数传过去的
            chainId: chainId,
            verifyingContract: contractAddr
        };
        //signNFTWhiteList(uint256 tokenId,address permitBuyer,uint256 nonce,uint256 deadline)
        const types = {
            signNFTWhiteList: [
                { name: "tokenId", type: "uint256" },
                { name: "permitBuyer", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ]
        };
         
        const nonce = await contract.nonces(signer.getAddress());
        const nonce2 = await signer?.getNonce();
        console.log(`nounce: ${nonce}, nonce2: ${nonce2}`);
        const deadline = Math.floor(Date.now() / 1000)+ 3600;
        const value = {
            tokenId: tokenId,
            permitBuyer: permitAddr,
            nonce: nonce,
            deadline: deadline
        };
        ;
        const signedData = await signer.signTypedData(domain, types, value);
        console.log("signedData:",signedData);
        setSigStr(signedData);
        return {signedData, deadline};
        
    }

    const checkSig = async (tokenId_ : string, permitAddr_ : string, deadline_ : string, sigStr_ : string) => {
        console.log(`tokenId: ${tokenId_}, permitAddr: ${permitAddr_}, deadline: ${deadline_}, sigStr: ${sigStr_}`);
        let splitSig = ethers.Signature.from(sigStr_);
        //console.log("splitSig:",splitSig);
        let result = await contract.checkNFTWhiteList(tokenId_, permitAddr_, ethers.parseUnits(deadline_, "wei"), splitSig.v, splitSig.r, splitSig.s);
        //console.log("checkSig result:",result);
    }

    const handleCheckSig = async () => {
        
        checkSig(tokenId, permitAddr, deadline.toString(), sigStr);
    }

    

    
    
    return (
        <div>
            <h3>NFTMarketAdminPanel</h3>
            <p>NFTMarketAddr: {NFTMarketAddr}</p>
            <p>ERC20Arr: {ERC20Arr}</p>
            <p>walletAddr: {walletAddr}</p>
            <button onClick={handleConnect}>connect</button>
            <br></br>
            <div>
                <input type="text" placeholder="enter tokenId" value = {tokenId} onChange={(event) => setTokenId(event.target.value)}/>
                <input type="text" placeholder="enter permitAddr" value = {permitAddr} onChange={(event) => setPermitAddr(event.target.value)}/>
                <button onClick={handleClickSig}>computeSignature</button>
                <p>sigStr: {sigStr}</p>
                <p>deadline: {deadline}</p>
            </div>
            <div>
                <button onClick={handleCheckSig}>CheckSig</button>
            </div>
            <div>
                <input type="text" placeholder="enter tokenId" value = {tokenIdCheck} onChange={(event) => setTokenIdCheck(event.target.value)}/>
                <input type="text" placeholder="enter permitAddr" value = {permitAddrCheck} onChange={(event) => setPermitAddrCheck(event.target.value)}/>
                <input type="text" placeholder="enter deadline" value = {deadlineCheck} onChange={(event) => setDeadlineCheck(parseInt(event.target.value))}/>
                <input type="text" placeholder="enter sigStr" value = {sigStrCheck} onChange={(event) => setSigStrCheck(event.target.value)}/>
                <button onClick={handleCheckSig}>CheckSig</button>
            </div>
            
            

        </div>
    )

    
}

export default NFTMarketAdminPanel;