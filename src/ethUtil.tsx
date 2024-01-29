import { ethers, formatUnits } from "ethers";

async function getSigner() : Promise<ethers.Signer | null>{
    console.log("getSigner");
    let signer : ethers.Signer | null = null;
    let provider : ethers.Provider|null = null;
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
    } else {
        provider = new ethers.BrowserProvider(window.ethereum);
    }
    console.log("get provider");
    if (provider == null) {
        console.log("provider is null");
        alert("provider is null");
        return null;
    }
    signer = await provider.getSigner();
    console.log("get signer");
    if (signer == null) {
        console.log("signer is null");
        alert("signer is null");
        return null;
    }

    return signer;
}



export{getSigner};