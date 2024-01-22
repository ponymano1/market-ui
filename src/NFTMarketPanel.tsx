import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import nftMarketAbi from "./abis/nftMarketAbi.json"

interface INFTPrice {tokenId: string, price: string};

function NFTMarketPanel({NFTMarketAddr}) {
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [walletAddr,setWalletAddr] = useState<string>("0x0");

    const [tokenId, setTokenId] = useState<string>("0");
    const [price, setPrice] = useState<string>("0");

    const [tokenIdBuy, setTokenIdBuy] = useState<string>("0");

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
            let contract = new ethers.Contract(NFTMarketAddr, nftMarketAbi, signer);
            setContract(contract);
        }
    }

    const listEx = async () => {
        let tx = await contract.listEx(ethers.parseUnits(tokenId, "wei"), ethers.parseUnits(price, 18));
        console.log("listEx tx: " + tx);
        console.log(tx)
        await tx.wait();
    }

    const buy = async (tokenId : string) => {
        let tx = await contract.buy(ethers.parseUnits(tokenId, "wei"));
        console.log("buy tx: " + tx);
        console.log(tx)
        await tx.wait();
    }

    // const listAllTokens = async () => {
    //     let tokens = await contract.listAllTokens();
    //     console.log("listAllTokens tx: " + tokens);
    // }


    return(
        <div>
            <h3>NFTMarketPanel</h3>
            <div>
                <button onClick={connectWallet}>connect wallet</button>
                <br></br>
                Wallet: {walletAddr}
                <br></br>
                <button onClick={connectContract}>connect Contract</button>
                <br></br>
                <input type="text" placeholder="tokenId" onChange={(e) => setTokenId(e.target.value)}></input>
                <input type="text" placeholder="price" onChange={(e) => setPrice(e.target.value)}></input>
                <button onClick={listEx}>listEx</button>
                <br></br>
                <input type="text" placeholder="tokenId" onChange={(e) => setTokenIdBuy(e.target.value)}></input>
                <button onClick={() => buy(tokenIdBuy)}>buy</button>

                    
            </div>
            
        </div>
    )
}

export default NFTMarketPanel;