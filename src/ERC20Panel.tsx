import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import erc20TokenAbi from "./abis/erc20TokenAbi.json"




function ERC20Panel({ERC20Arr, NFTMarketArr : string}) {
    const [erc20Contrct, setErc20Contract] = useState<ethers.Contract | null>(null)
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [balance, setBalance] = useState<string>("0")
    const [mintAmount, setMintAmount] = useState<string>("0")

    const [amount, setAmount] = useState<string>("0")
    const [walletAddr, setWalletAddr] = useState<string>("0x0")
    const [erc20Addr, setErc20Arr] = useState<string>("0x0")

    useEffect(() => {
        connectWallet();
        showWallet();
        connectERC20();
        
    },[])

    const connectWallet = async () => {
        if (window.window.ethereum) {
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
        connectERC20();
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

    const connectERC20 = async () => {
        console.log("connectERC20");
        if (signer == null) {
            console.log("signer is null");
        } else {
            console.log("signer is not null");
            let erc20Contract = new ethers.Contract(ERC20Arr, erc20TokenAbi, signer);
            setErc20Contract(erc20Contract);
            let erc20Balance = await erc20Contract.balanceOf(walletAddr);
            console.log(ethers.formatUnits(erc20Balance, 18));
            setBalance(ethers.formatUnits(erc20Balance, 18));
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

        let tx = await erc20Contrct.approve(NFTMarketArr, ethers.formatUnits(amount, 18));
        console.log(tx);
        await tx.wait();
    }



    return (
        <div>
            <h3>ERC20Panel</h3>
            <div>
                <button onClick={connectWallet}>connect Wallet</button>
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
