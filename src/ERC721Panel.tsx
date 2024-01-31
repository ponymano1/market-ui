import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import erc721Abi from "./abis/erc721Abi.json"

function NFTPanel({Erc721Addr, NFTMarketAddr}) {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [walletAddr,setWalletAddr] = useState<string>("0x0");
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [toAddr, setToAddr] = useState<string>("0x0");
    const [uri, setUri] = useState<string>("0");

    const [tokenId, setTokenId] = useState<string>("0");
    const [tokenOwner, setTokenOwner] = useState<string>("0x0");

    const [approveTokenId, setApproveTokenId] = useState<string>("0");

    useEffect(() => {  
        handleConnect();
    },[])


    
    const handleConnect = async() => {
        let provider : ethers.Provider|null = null;
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum) 
        } else {
            provider = new ethers.BrowserProvider(window.ethereum)
        }   
        let signerObj = await provider.getSigner();   
        setSigner(signerObj);  
        let walletArrObj = await signerObj.getAddress();
        setWalletAddr(walletArrObj);
        let contract = new ethers.Contract(Erc721Addr, erc721Abi, signerObj);
        console.log("get erc721ContractObj ok Erc721Addr: " + await contract.getAddress());
        console.log("get erc721ContractObj ok wallet Address: " + walletArrObj);
        setContract(contract);
    }
 
    const connectWallet = async() => {
        if (window.ethereum) {
            let provider = new ethers.BrowserProvider(window.ethereum)
            let signerObj = await provider.getSigner();
            setSigner(signerObj);
            setWalletAddr(await signerObj.getAddress());
            console.log("" + walletAddr); 
        } else {
            let provider = new ethers.BrowserProvider(window.ethereum)
            let signerObj = await provider.getSigner();
            setSigner(signerObj);
            setWalletAddr(await signerObj.getAddress());
            console.log("" + walletAddr); 
        }
    }

    const  connectContract = async()=> {
        if (signer == null) {
            console.log("signer is null");
        } else {
            console.log("signer is not null");
            let contract = new ethers.Contract(Erc721Addr, erc721Abi, signer);
            setContract(contract);
        }
    }

    const mint = async() => {
        console.log("call mint");
        if (contract == null) {
            console.log("erc721 mint contract is null");
            return;
        }

        if (signer == null) {
            console.log("signer is null");
            return;
        }

        let tx = await contract.mint(toAddr, uri);
        console.log("mint tx: " + tx);
        console.log(tx)
        let tokenId= await tx.wait();
        console.log("mint tokenId: " + tokenId);
        console.log(tokenId);
    }

    const showTokenOwner = async() => {
        console.log("call showTokenOwner");
        if (contract == null) {
            console.log("erc721 mint contract is null");
            return;
        }

        if (signer == null) {
            console.log("signer is null");
            return;
        }
        console.log("showTokenOwner Erc721Addr: " + await contract.getAddress());
        let owner = await contract.ownerOf(ethers.parseUnits(tokenId, "wei"));
        setTokenOwner(owner);
    }

    const approve = async() => {
        console.log("call approve");
        if (contract == null) {
            console.log("erc721 mint contract is null");
            return;
        }

        if (signer == null) {
            console.log("signer is null");
            return;
        }

        let tx = await contract.approve(NFTMarketAddr, ethers.parseUnits(approveTokenId, "wei"));
        await tx.wait();
        console.log("approve: " + approveTokenId);
        
    }

    const approveAll = async() => {
        console.log("call approveAll");
        if (contract == null) {
            console.log("erc721 mint contract is null");
            return;
        }

        if (signer == null) {
            console.log("signer is null");
            return;
        }

        let tx = await contract.setApprovalForAll(NFTMarketAddr, true);
        await tx.wait();
        console.log("approveAll: " + NFTMarketAddr);
    }


    return(
        <div>
            <h3>ERC721Panel</h3>
            <div>
                {walletAddr}
                <button onClick={handleConnect}>connect Contract</button>
                <br></br>
                <input type="text" placeholder="toAddr" onChange={(e) => setToAddr(e.target.value)}></input>
                <input type="text" placeholder="uri" onChange={(e) => setUri(e.target.value)}></input>
                <br></br>
                <button onClick={mint}>mint</button>
                <br></br>
                <input type="text" placeholder="tokenId" onChange={(e) => setTokenId(e.target.value)}></input>
                <button onClick={showTokenOwner}>showTokenOwner</button>
                Owner : {tokenOwner}
                <br></br>
                <input type="text" placeholder="tokenId" onChange={(e) => setApproveTokenId(e.target.value)}></input>
                <button onClick={approve}>approve</button>
                <button onClick={approveAll}>approveAll</button>

                    
            </div>
            
        </div>
    )



}

export default NFTPanel;