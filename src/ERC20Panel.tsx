import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import erc20TokenAbi from "./abis/erc20TokenAbi.json"




function ERC20Panel({ERC20Arr, NFTMarketArr}) {
    const [erc20Contrct, setErc20Contract] = useState<ethers.Contract | null>(null)
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [balance, setBalance] = useState<string>("0")
    const [mintAmount, setMintAmount] = useState<string>("0")

    const [amount, setAmount] = useState<string>("0")
    const [walletAddr, setWalletAddr] = useState<string>("0x0")
    const [erc20Addr, setErc20Arr] = useState<string>("0x0")

    useEffect(() => {
        handleConnect();

        
    },[])

    const handleConnect = async() => { 
        console.log("handleConnect");
        let signerObj : ethers.Signer | null = null;
        let provider : ethers.Provider|null = null;
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
        } else {
            provider = new ethers.BrowserProvider(window.ethereum);
        }
        console.log("get provider");
        if (provider == null) {
            console.log("provider is null");
            return;
        }
        signerObj = await provider.getSigner();
        console.log("get signer");
        if (signerObj == null) {
            console.log("signerObj is null");
            return;
        }
        console.log("ERC20Arr: " + ERC20Arr);
        console.log("signerObj: " + signerObj);
        let erc20ContractObj = new ethers.Contract(ERC20Arr, erc20TokenAbi, signerObj);
        console.log("get erc20ContractObj ok");
        let walletAddrObj = await signerObj.getAddress();
        console.log("get walletAddrObj from signerObj:" + walletAddrObj);
        let erc20Balance = await erc20ContractObj.balanceOf(walletAddrObj);
        setWalletAddr(walletAddrObj);
        setErc20Contract(erc20ContractObj);
        setBalance(ethers.formatUnits(erc20Balance, 18));
        setSigner(signerObj);


    }


    
    const showWallet = async () => {
        console.log("showWallet");
        if (signer == null) {
            console.log("signer is null");
        } else {
            console.log("signer is not null");
            setWalletAddr(await signer?.getAddress());
        }
    }


    const mint = async () => {
        if (signer == null) {
            console.log("signer is null");
            return;
        }

        if (erc20Contrct == null) {
            console.log("erc20Contrct is null");
            return;
        }

        let tx = await erc20Contrct.mint(walletAddr, ethers.parseUnits(mintAmount, 18));
        console.log(tx);
        await tx.wait();
        setBalance(ethers.formatUnits(await erc20Contrct.balanceOf(walletAddr), 18));
    }

    const approve = async () => {   
        if (signer == null) {
            console.log("signer is null");
            return;
        }

        if (erc20Contrct == null) {
            console.log("erc20Contrct is null");
            return;
        }

        let tx = await erc20Contrct.approve(NFTMarketArr, ethers.parseUnits(amount, 18));
        console.log(tx);
        await tx.wait();
    }



    return (
        <div>
            <h3>ERC20Panel</h3>
            <div>
                <button onClick={handleConnect}>connect Wallet</button>
                WalletAddr: {walletAddr}
                <br></br>
                balance: {balance}
                <br></br>
                <input type="text" placeholder="enter amount" value = {mintAmount} onChange={(event) => setMintAmount(event.target.value)}/>
                <button onClick={mint}>mint</button>
                <br></br>
                <input type="text" placeholder="enter amount" value = {amount} onChange={(event) => setAmount(event.target.value)}/>
                <button onClick={(approve)}> approve</button>

                    
            </div>
            
        </div>
    )
}


export default ERC20Panel;
