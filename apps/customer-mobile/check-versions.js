["expo","expo-constants","expo-modules-core","react","react-native"].forEach(function(n){
  try {
    const p = require(require.resolve(n + "/package.json", { paths: [process.cwd()] }));
    console.log(n + " => " + p.version);
  } catch (e) {
    console.log(n + " => NOT FOUND");
    console.log(String(e.message || e));
  }
});
