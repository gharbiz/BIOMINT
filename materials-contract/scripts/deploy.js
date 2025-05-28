async function main() {
  const Materials = await ethers.getContractFactory("MaterialsERC1155");
  const materials = await Materials.deploy(
    "https://indigo-tiny-ox-721.mypinata.cloud/ipfs/bafybeiffw4nm4c5dhpomwbigesjntfwhk7r2cibuo6odf7tfruxmzh6jui/{id}.json"
  );
  await materials.deployed();
  console.log("MaterialsERC1155 déployé à :", materials.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
