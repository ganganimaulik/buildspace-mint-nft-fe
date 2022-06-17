import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'ganganimaulik';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-5pil8s7tma';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x8072DFeB68b403Fb83aD2B887176d9D238cD939b";
  
const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [totalNFTsMintedSoFar, setTotalNFTsMintedSoFar] = useState('');
  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

   /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener()
    } else {
      console.log("No authorized account found");
    }

  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener()
    } catch (error) {
      console.log(error);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  const setTotalMintedNft = (n) => setTotalNFTsMintedSoFar(`${n}/10 nft minted`);
  
  const askContractToMintNft = async () => {
    setIsloading(true);
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        await checkForRinkebyNetwork();
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
  
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
  
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
    setIsloading(false);
  }

  const checkForRinkebyNetwork = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' });

    console.log("Connected to chain " + chainId);
      
    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      throw new Error('You are not connected to the Rinkeby Test Network!')
    }

  }

   // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        await checkForRinkebyNetwork();
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);


        let txn = await connectedContract.getTotalNFTsMintedSoFar();
        setTotalMintedNft(txn.toNumber());
        
        connectedContract.on("NewEpicNFTMinted", async (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
          let txn = await connectedContract.getTotalNFTsMintedSoFar();
          setTotalMintedNft(txn.toNumber());
        });

       
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} disabled={isLoading} className="cta-button connect-wallet-button">
              {isLoading ? 'Loading..' : 'Mint NFT'}
            </button>
          )}
          {totalNFTsMintedSoFar && <p className='footer-text'>{totalNFTsMintedSoFar}</p>}
        </div>
       
        <div className="footer-container footer-text">
           🌊 <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >View Collection on OpenSea</a>
         &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a> 
        </div>
      </div>
    </div>
  );
};

export default App;