import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import nftMarketAbi from "./abis/nftMarketAbi.json"

interface INFTPrice {tokenId: string, price: string};

function NFTMarketPanel({NFTMarketAddr}:{NFTMarketAddr:string}) {
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [walletAddr,setWalletAddr] = useState<string>("0x0");

    const [tokenId, setTokenId] = useState<string>("0");
    const [price, setPrice] = useState<string>("0");

    const [tokenIdBuy, setTokenIdBuy] = useState<string>("0");
    const [eventList, setEventList] = useState<any[]>([]);
    
    useEffect(() => {  
        handleConnect();
    }
    ,[])

    useEffect(() => {
        
        const interval = setInterval(() => {
            fetchAndParseLogs(0, 10000000);
        }, 1000);
        return () => clearInterval(interval);
    },[signer])
    
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
        setWalletAddr(await signerObj.getAddress());
        let contract = new ethers.Contract(NFTMarketAddr, nftMarketAbi, signerObj);
        setContract(contract);
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

    const fetchAndParseLogs = async (from : number, to : number) => {
        let currentBlock = await signer?.provider?.getBlockNumber();
        console.log("currentBlock: " + currentBlock);
        let filter = {
            address: NFTMarketAddr,
            fromBlock: from,
            toBlock: to,
        }

        if (to > currentBlock) {
            filter.toBlock = currentBlock;
        }

        let logs = await signer?.provider?.getLogs(filter);
        if (logs == null) {
            console.log("logs is null");
            return;
        }

        let parsedLogs = logs.map((log) => {
            contract?.interface.parseLog(log);
        });
        console.log("parsedLogs: " + parsedLogs);
        console.log(parsedLogs);
        setEventList(parsedLogs);
    }


    return(
        <div>
            <h3>NFTMarketPanel</h3>
            <div>
                <button onClick={handleConnect}>connect wallet</button>
                <br></br>
                Wallet: {walletAddr}
               
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