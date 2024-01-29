import { useState, useEffect } from 'react'
import { ethers, formatUnits } from "ethers";
import nftMarketAbi from "./abis/nftMarketAbiWithSig.json"
import erc20TokenAbi from "./abis/erc20TokenAbi.json"

interface INFTPrice {tokenId: string, price: string};


function NFTMarketPanel({NFTMarketAddr, ERC20Arr}:{NFTMarketAddr:string, ERC20Arr:string}) {
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [walletAddr,setWalletAddr] = useState<string>("0x0");

    const [tokenId, setTokenId] = useState<string>("0");
    const [price, setPrice] = useState<string>("0");

    const [tokenIdBuy, setTokenIdBuy] = useState<string>("0");
    const [tokenIdPrice, setTokenIdPrice] = useState<string>([0]);

    const [eventList, setEventList] = useState<any[]>([]);

    const[blockId, setBlockId] = useState<number>(0);

    const [signatureTxt, setSignatureTxt] = useState<string>("0x0");
    const [deadlineTxt, setDeadlineTxt] = useState<string>("0x0");
    
    useEffect(() => {  
        handleConnect();
    }
    ,[])

    useEffect(() => {
        
        // const interval = setInterval(() => {
        //     fetchAndParseLogs();
        // }, 3000);
        // return () => clearInterval(interval);
    },[signer, blockId, contract, eventList])

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
        let tx = await contract.list(ethers.parseUnits(tokenId, "wei"), ethers.parseUnits(price, 18));
        console.log("listEx tx: " + tx);
        console.log(tx)
        await tx.wait();
    }

    const buy = async (tokenId : string) => {
        let price = await contract.getPrice(ethers.parseUnits(tokenId, "wei"));
        if (price == null) {
            console.log("price is null");
            return;
        }

        let erc20Contract = new ethers.Contract(ERC20Arr, erc20TokenAbi, signer);
        let approved = await erc20Contract.allowance(walletAddr, NFTMarketAddr);
        if (approved < price) {
            let tx = await erc20Contract.approve(NFTMarketAddr, price);
            await tx.wait();
        }
        let tx = await contract.buy(ethers.parseUnits(tokenId, "wei"));
        console.log("buy tx: " + tx);
        console.log(tx)
        await tx.wait();
    }

    const handlePermitBuy = async () => {
        let tx = await permitAndBuy(tokenId, signatureTxt, deadlineTxt);
        tx.wait();
    }

    const permitAndBuy = async (tokenId : string, signature : string, deadline : string) => {
        const splitSig = ethers.Signature.from(signature);
        console.log("splitSig:",splitSig);
        let tx = await contract.permitAndBuy(ethers.parseUnits(tokenId, "wei") , signer.getAddress() , ethers.parseUnits(deadline, "wei"), splitSig.v, splitSig.r, splitSig.s);
        console.log("permitAndBuy tx: " + tx);

        tx.wait();

    }

    const showPrice = async () => { 
        let price = await contract.getPrice(ethers.parseUnits(tokenIdBuy, "wei"));
        console.log("showPrice tx: " + price);
        setTokenIdPrice(formatUnits(price, 18));
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

        let parsedListLogs = listLogs
        .map((log) => { 
            let logObj =  contract?.interface.parseLog(log) 
            //console.log(logObj);
            return logObj;
        })
        .filter(parsedLog => parsedLog?.name)
        .filter(parsedLog => parsedLog.name === "List")
        .map(parsedLog => {
            const {tokenId, from, price} = parsedLog.args;
            console.log("List tokenId: " + tokenId + " from: " + from + " price: " + price);
            //返回字符串
            return {event: "List", tokenId: formatUnits(tokenId), from: from, price: formatUnits(price)};
        });

        let parsedSoldLogs = soldLogs
        .map((log) => { return contract?.interface.parseLog(log) })
        .filter(parsedLog => parsedLog?.name != null)
        .filter(parsedLog => parsedLog.name === "Sold")
        .map(parsedLog => {
            const {tokenId, from, to, price} = parsedLog.args;
            console.log("Sold tokenId: " + tokenId + " from: " + from + " to: " + to + " price: " + price);
            //返回字符串
            return {event: "Sold", tokenId: formatUnits(tokenId), from: from, to: to, price: formatUnits(price)};
        });


        let parsedLogs = [...parsedListLogs, ...parsedSoldLogs]

        
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
                {tokenIdPrice}
                <button onClick={showPrice}>showPrice</button>
                <button onClick={() => buy(tokenIdBuy)}>buy</button>

                 <div>
                    <input type="text" placeholder="tokenId" onChange={(e) => setTokenIdBuy(e.target.value)}></input>
                    <input type="text" placeholder="signature" onChange={(e) => setSignatureTxt(e.target.value)}></input>
                    <input type="text" placeholder="deadline" onChange={(e) => setDeadlineTxt(e.target.value)}></input>
                    <button onClick={handlePermitBuy}>permitAndBuy</button>
                </div> 

                <ul>
                    {eventList.map((event, index) => {
                        return <li key={index}>{JSON.stringify(event, null, 2)}</li>
                    })}
                </ul>

                    
            </div>
            
        </div>
    )
}

export default NFTMarketPanel;