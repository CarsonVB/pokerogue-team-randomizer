const secretKey = 'x0i2O7WRiANTqPmZ';

var budget = 10;
var saveData = {};

//redo for tiered set later
const legendaries = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 716, 717, 718, 719, 720, 721, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 803, 804, 805, 806, 807, 808, 809, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1020, 1021, 1022, 1023, 1024, 1025];

const attack = {
  'physical': 1,
  'special': 3
};

var pokedex = JSON.parse(data)[0];

function atkToggle() {
  var chkBox = document.getElementById('primaryAtk');
  var primAtk = document.getElementById('primaryAtkChk');
  var atk = document.getElementById('atkChk');
  if (chkBox.checked) {
    primAtk.style.display = 'block';
    atk.style.display = 'none';
  } else {
    primAtk.style.display = 'none';
    atk.style.display = 'block';
  }
}

atkToggle();

function massCheckGens(){
  var check = true;
  var gensCheck = document.getElementsByClassName('gen-checkbox');
  for(let i=0; i<gensCheck.length; i++){
    if (gensCheck[i].checked)
      check = false;
  }
  for(let i=0; i<gensCheck.length; i++){
    gensCheck[i].checked=check;
  }
}

function massCheckTypes(){
  var check = true;
  var typeCheck = document.getElementsByClassName('type-checkbox');
  for(let i=0; i<typeCheck.length; i++){
    if (typeCheck[i].checked)
      check = false;
  }
  for(let i=0; i<typeCheck.length; i++){
    typeCheck[i].checked=check;
  }
}


document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const prsvData = e.target.result;
                var decrypted = CryptoJS.AES.decrypt(prsvData, secretKey).toString(CryptoJS.enc.Utf8);
                saveData = JSON.parse(decrypted);
                console.log(saveData['trainerId']);
                document.getElementById('goButton').style.display = 'block';

            } catch (error) {
                console.error('Error parsing PRSV:', error.message);
            }
        };

        reader.onerror = function() {
            console.error('Error reading file:', reader.error.message);
        };

        reader.readAsText(file);
    } else {
        console.error('No file selected');
    }
});

function reduceCost(cost, value){
  for (let v = 0; v < value; v++){
    if (cost > 1) {
      cost--;
    } else {
      cost /= 2;
    }
  }
  return cost;
};

/*
  seenAttr: '$sa',
  caughtAttr: '$ca',
  natureAttr: '$na',
  seenCount: '$s' ,
  caughtCount: '$c',
  hatchedCount: '$hc',
  ivs: '$i',
  moveset: '$m',
  eggMoves: '$em',
  candyCount: '$x',
  friendship: '$f',
  abilityAttr: '$a',
  passiveAttr: '$pa',
  valueReduction: '$vr',
  classicWinCount: '$wc'
*/

function createParty(){
  for (let i = 0; i < 6; i++){
    img_slot = 'slot' + i.toString();
    document.getElementById(img_slot).src = '';
    document.getElementById(img_slot).alt = '';
    document.getElementById(img_slot+'_text').innerHTML = '';
  }

  var finalList = [];
  var starterList = {};
  var slots = 6;
  var legends = document.getElementById('legends').checked;
  var noWin = document.getElementById('unwon').checked;
  var priAtk = document.getElementById('primaryAtk').checked;
  var budget = document.getElementById('budget').value;
  var gens = [];
  var types = new Set();

  for (gen of document.getElementsByClassName('gen-checkbox')) {
    if (gen.checked)
      gens.push(parseInt(gen.value));
  }
  for (type of document.getElementsByClassName('type-checkbox')) {
    if (type.checked)
      types.add(type.value);
  }

  let dexSave = saveData.dexData;
  let starterSave = saveData.starterData;

  let ivs = {
    'hp': document.getElementById('hp').value,
    'atk': document.getElementById('atk').value,
    'def': document.getElementById('def').value,
    'spa': document.getElementById('spa').value,
    'spd': document.getElementById('spd').value,
    'spe': document.getElementById('spe').value,
    'priAtk': document.getElementById('sharedAtk').value
  };

  for (const mon of Object.keys(starterSave)) {
    if ( mon >= 2000) {
      break;
    }
    if (!gens.includes(pokedex[mon].gen)){
      continue;
    }
    if (!pokedex[mon].types.some(element => types.has(element))){
      continue;
    }
    if (!legends && legendaries.includes(parseInt(mon))){
      continue;
    }
    if (dexSave[mon]['$ca'] == 0) {
      continue;
    }
    if (noWin == true && (starterSave[mon]['$wc'] > 0)){
      continue;
    }
    let cost = reduceCost(pokedex[mon].cost, starterSave[mon]['$vr']);
    if (cost > budget){
      continue;
    }
    if (priAtk){
      if (pokedex[mon].attack != "mixed"){
        if(dexSave[mon]['$i'][attack[pokedex[mon].attack]] < ivs['priAtk']) {
          continue;
        }
      }else{
        if ((dexSave[mon]['$i'][1] < ivs['priAtk']) && (dexSave[mon]['$i'][3] < ivs['priAtk'])) {
          continue;
        }
      }
    }else{
      if (dexSave[mon]['$i'][1] < ivs['atk']) {
        continue;
      }
      if (dexSave[mon]['$i'][3] < ivs['spa']) {
        continue;
      }
    }
    if (dexSave[mon]['$i'][5] < ivs['spe']){
      continue;
    }
    if (dexSave[mon]['$i'][0] < ivs['hp']){
      continue;
    }
    if (dexSave[mon]['$i'][2] < ivs['def']){
      continue;
    }
    if (dexSave[mon]['$i'][4] < ivs['spd']){
      continue;
    }
    starterList[mon] = {
      "cost": cost,
      "name": pokedex[mon].name,
      "gen": pokedex[mon].gen,
      "type1": pokedex[mon].type1,
      "type2": pokedex[mon].type2
    }
  }
  while ((budget > 0) && (slots > 0)) {
    //ensure all points are used to stop really unfun teams of 6 1pt bug types
    if ((slots == 1) && (budget > 1)) {
      for (const mon of Object.keys(starterList)) {
        if (starterList[mon].cost < budget) {
          delete starterList[mon];
        }
      }
    }
    const mons = Object.keys(starterList);
    if (mons.length == 0){
      break;
    }
    var randomMon = mons[Math.floor(Math.random() * mons.length)];
    finalList.push(randomMon);
    budget -= starterList[randomMon].cost;
    slots--;
    delete starterList[randomMon];
    for (const mon of Object.keys(starterList)) {
      if (starterList[mon].cost > budget) {
        delete starterList[mon];
      }
    }
  }
  for (const mon in finalList){
    img_slot = 'slot' + mon.toString();
    //not sure of a good resource for images/sprites of pokemon that can be easily accessed based on dex # or name. pokemon.com rate limits after ~20 images
    document.getElementById(img_slot).src = 'https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/' + String(finalList[mon]).padStart(3, '0') + '.png';
    document.getElementById(img_slot).alt = pokedex[finalList[mon]].name;
    document.getElementById(img_slot+'_text').innerHTML = pokedex[finalList[mon]].name;
    console.log(pokedex[finalList[mon]]);
  }
};
