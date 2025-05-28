async function main() {
  const Materials = await ethers.getContractFactory("JeanBioNFT");
  const materials = await Materials.deploy();
  await materials.deployed();
  console.log("JeanBioNFT déployé à :", materials.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
