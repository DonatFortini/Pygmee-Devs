# Pygmee

<p align="center"><img src="./src/assets/logo_pygmee.png" width="500" height="250"></p>

Le but du projet est de créer une application simplifiant la simulation, de lui donner un aspect graphique et textuel pour simplifier la tache à toute personne voulant s'exercer.


## description du projet


Permet de faciliter la simulation. L’utilisateur peut importer ou créer des modèles puis il peut les modifier et visualiser en fonction de divers paramètres.


La principale caractéristique de l'app est sa capacité à interagir graphiquement pour générer des modèles et des paramètres les concernant.


Permet à la fin de générer un fichier .amd ou python utilisable directement sur DEVSimPy.

## maquette figma

https://www.figma.com/file/nWCcV2KAqVB1jRD2HQf7bp/pygmee?t=DFdNpP9iYdhuLzfG-0

## Liens partie théorique

* [choix des technologies](./Théorique/markdown/choix_technologies.md)
* [liste des fonctionnalités](./Théorique/markdown/liste_fonctionnalités.md)
* [parcours de l'utilisateur](./Théorique/markdown/parcours_utilisateur.md)
* [liste des ressources utilisées pour le projet](./Théorique/markdown/ressources_utilisées.md)

## Instruction d'installation

### Linux :

#### Etape 1 : Node et npm 

Tout d'abord verifié que tout est bien installé.

```bash
nvm -v
npm -v
node -v
```
Sinon :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

source ~/.bashrc

nvm install latest

sudo apt install npm

npm install -g npm

```

#### Etape 2 : Rust et tauri

Rust :

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version
```
Tauri :

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

```npm
npm install -g @tauri-apps/cli
```

#### Etape 3 : Typescript

```npm
npm install -g typescript
```


## Instruction d'utilisation

Pour passer le projet en mode dev :

```npm
npm run tauri dev
```

Pour build le projet (faire un executable) :
```npm
npm run tauri build
```

## Comment contribuer ou report une erreur

## Liste des auteurs et contributeurs
