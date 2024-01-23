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

    const[blockId, setBlockId] = useState<number>(0);
    
    useEffect(() => {  
        handleConnect();
    }
    ,[])

    useEffect(() => {
        
        const interval = setInterval(() => {
            fetchAndParseLogs();
        }, 1000);
        return () => clearInterval(interval);
    },[signer, blockId, contract])

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

    const fetchAndParseLogs = async () => {
        let currentBlock = await signer?.provider?.getBlockNumber();
        
        if (currentBlock == null) {
            console.log("currentBlock is null");
            return;
        }
        console.log("blockId: " + blockId); 
        if (blockId >= currentBlock) {
            console.log("blockId >= currentBlock");
            return;
        }
        
        const listEvent = contract?.filters.List(null, null, null);
        const soldEvent = contract?.filters.Sold(null, null, null, null);
        
        let listLogs = await signer?.provider.getLogs({
            ...listEvent,
            fromBlock: blockId,
            toBlock: currentBlock
        });

        let soldLogs = await signer?.provider.getLogs({
            ...soldEvent,
            fromBlock: blockId,
            toBlock: currentBlock
        });

        let parsedLogs = [...listLogs, ...soldLogs].map((log) => {
            console.log("log: " + log);
            return contract?.interface.parseLog(log);
        });
        console.log("parsedLogs: " + parsedLogs);
        console.log(parsedLogs);
        
        setEventList((prevEventList) => [...prevEventList, ...parsedLogs]);
        setBlockId(currentBlock);
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