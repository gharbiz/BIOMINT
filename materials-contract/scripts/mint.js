async function main() {
  const [deployer] = await ethers.getSigners();

  const materials = await ethers.getContractAt(
    "MaterialsERC1155",
    "0xB7EaeCF4BFA4D659B4e3c3a77adc274c1DeD29aC"
  );

  // Ex: 5 unités de Organic Cotton (ID: 1)
  const tx = await materials.mintMaterials(
    "0x6A6f327f44cabC3c57e55dE89412B2B55AddE681", 
    1, 
    5
  );

  await tx.wait();
  console.log("✅ Matériaux mintés !");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
