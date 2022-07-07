async function main() {
  const [deployer, bonder, user, randomEOA] = await ethers.getSigners();
  console.log(deployer);

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const TelfordDestination = await ethers.getContractFactory("TelfordDestination");
  telfordDestination = await TelfordDestination.deploy(
      bonder.address,
      "0x4200000000000000000000000000000000000007",
      "0xb5cf88Df79CfdFe52572C5F015017fe486979b61"
  );

  console.log("TelfordDestination Address:", telfordDestination.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
