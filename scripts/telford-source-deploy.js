async function main() {
	const [deployer] = await ethers.getSigners();
  
	console.log("Deploying contracts with the account:", deployer.address);
  
	console.log("Account balance:", (await deployer.getBalance()).toString());
  
	const TelfordSource = await ethers.getContractFactory("TelfordSource");
	const telfordSource = await TelfordSource.deploy("0x6aaE91d02706065833D3AA032c9eeBe8F2996c72", "0x6aaE91d02706065833D3AA032c9eeBe8F2996c72");
  
	console.log("TelfordSource address:", telfordSource.address);
  }
  
  main()
	.then(() => process.exit(0))
	.catch((error) => {
	  console.error(error);
	  process.exit(1);
	});