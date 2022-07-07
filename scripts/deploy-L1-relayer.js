async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const L1Relayer = await ethers.getContractFactory("TelfordSource");
  const l1Relayer = await L1Relayer.deploy("0x842C4B03c18c9148532E5519FAe97991aCCBEcA8", "0x842C4B03c18c9148532E5519FAe97991aCCBEcA8");

  console.log("L1Relayer address:", l1Relayer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });