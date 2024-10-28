import json
import requests

pokedex = {}
costs = {}

response = requests.get('https://raw.githubusercontent.com/CarsonVB/pokerogue-team-randomizer/main/pokedex.json')
if response.status_code == 200:
    content = response.text
    start = content.find("var data = `[") + len("var data = `[")
    end = content.rfind("]`;")
    json_str = content[start:end].strip()
    pokedex = json.loads(json_str)
else:
    print('Failed to fetch existing pokedex data')

response = requests.get('https://raw.githubusercontent.com/pagefaultgames/pokerogue/main/src/data/balance/starters.ts')
if response.status_code == 200:
    content = response.text
    start = content.find("export const speciesStarterCosts = ") + len("export const speciesStarterCosts = ")
    end = content.find(";", start)
    parts = content[start:end].replace("[Species.", "\"").replace("]", "\"").rsplit(',')
    json_str = ",".join(parts[:-1]) + "\n}"
    costs = json.loads(json_str)
else:
    print('Failed to fetch cost data')

for poke in pokedex.values():
    if poke['starter']:
        poke['cost'] = costs[poke['pr_name']]

output_str = "var data = `[" + json.dumps(pokedex, indent=2) + "]`;"

with open("pokedex.json", "w") as outfile:
    outfile.write(output_str)
