const openpgp = require("openpgp");
const fs = require("fs");
const path = require("path");
const prompt = require("prompt-sync")({ sigint: true });
const directoryPath = path.join(process.cwd(), "keys");

(async () => {
  const name = prompt("Name: ");
  const email = prompt("Email: ");
  const passphrase = prompt("Passphrase: ");
  const curve = prompt("Curve: (default ed25519) ");
  await generate(name, email, passphrase, curve);
})();

// generate();
async function generate(name, email, passphrase, curve = "") {
  if (curve == "") curve = "ed25519";
  const dataGenerate = await openpgp.generateKey({
    userIDs: [{ name, email }],
    curve,
    passphrase,
  });
  console.log("\nPublic Key:\n");
  console.log(dataGenerate.publicKey);
  console.log("\nPrivate Key:\n");
  console.log(dataGenerate.privateKey);
  fs.writeFileSync(path.join(directoryPath, "new_secret.txt"), dataGenerate.privateKey);
  fs.writeFileSync(path.join(directoryPath, "new_public.txt"), dataGenerate.publicKey);
  console.log("Archivos generados: new_secret.txt, new_public.txt en", directoryPath);
}
