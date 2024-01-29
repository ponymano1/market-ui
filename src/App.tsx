import { useState } from 'react'
import { ethers } from "ethers";
import './App.css'
import  ERC20Panel  from './ERC20Panel'
import NFTPanel  from './ERC721Panel'
import NFTMarketPanel from './NFTMarketPanel'
import NFTMarketAdminPanel from './NFTMarketAdminPanel'

const erc20Addr = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
const nftMarketAddr = "0xfbAb4aa40C202E4e80390171E82379824f7372dd";
const erc721Addr = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";

// const erc20Addr = "0xf740CcC19Dc26d34F86c70F3d67c1AC69A2c7330";
// const nftMarketAddr = "0xBDC2e744B4A111234e5A76d48e1089dCBa35a392";
// const erc721Addr = "0x14892F51c774ee5811FF53613153C7BaeeddC7DA";

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
      <div>
        <ERC20Panel ERC20Arr = {erc20Addr} NFTMarketArr = {nftMarketAddr}/>
        <NFTPanel Erc721Addr = {erc721Addr} NFTMarketAddr = {nftMarketAddr}/>
        <NFTMarketPanel  NFTMarketAddr = {nftMarketAddr} ERC20Arr={erc20Addr}/>
        <NFTMarketAdminPanel  NFTMarketAddr = {nftMarketAddr} ERC20Arr={erc20Addr}/>
        
      </div>

    </>
  )
}

export default App;
