import { useState } from 'react'
import { ethers } from "ethers";
import './App.css'
import  ERC20Panel  from './ERC20Panel'
import NFTPanel  from './ERC721Panel'
import NFTMarketPanel from './NFTMarketPanel'

const erc20Addr = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
const nftMarketAddr = "0x0b48aF34f4c854F5ae1A3D587da471FeA45bAD52";
const erc721Addr = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";

function App() {
  const [count, setCount] = useState(0)
  const [walletAddr, setWalletAddr] = useState<string>("0x0")
  let provider : ethers.Provider|null = null;
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const handleWalletConnect = async () => {

    if (window.ethereum == null) {
        provider = ethers.getDefaultProvider();
        console.log("window.ethereum == null");
        let signerObj = await provider.getSigner();
        setSigner(signerObj);
        setWalletAddr(await signerObj.getAddress());
        console.log(walletAddr);
    } else {
        provider = new ethers.BrowserProvider(window.ethereum)
        let signerObj = await provider.getSigner();
        setSigner(signerObj);
        setWalletAddr(await signerObj.getAddress());
        console.log(walletAddr); 
    }

}

  return (
    <>

      <h3>NFTMarket</h3>
     
      <div className="card">
        <button onClick={handleWalletConnect}>connect wallet</button>
        <br></br>
        Wallet: {walletAddr}
      
        <button onClick={() => setCount((count) => count + 2)}>
          count is {count}
        </button>
        
      </div>
      <div>
        <ERC20Panel ERC20Arr = {erc20Addr} NFTMarketArr = {nftMarketAddr}/>
        <NFTPanel Erc721Addr = {erc721Addr} NFTMarketAddr = {nftMarketAddr}/>
        <NFTMarketPanel  NFTMarketAddr = {nftMarketAddr}/>
        
      </div>

    </>
  )
}

export default App;
