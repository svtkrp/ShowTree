import React from 'react';
import ReactDOM from 'react-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { ThemeProvider } from '@material-ui/styles';

import MyAlert from '../common/MyAlert.js';
import MyButton from '../common/MyButton.js';
import MyNumberField from '../common/MyNumberField.js';
import MyControlText from '../common/MyControlText.js';
import MyJsonPaper from '../common/MyJsonPaper.js';
import MyIconButtonUp from '../common/MyIconButtonUp.js';
import MyIconButtonDown from '../common/MyIconButtonDown.js';
import getTheme from '../common/get_theme.js';
import '../common/main.css';

import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

import arrayToBTree from './array_to_BTree.js';
import BTreeToArray from './BTree_to_array.js';
import getGraphData from './BTree_to_graph_data2.js';
import createUUID from '../common/create_uuid.js';

// value in text field
var currentValue = 5;

// Knuth order - сколько ссылок может быть во внутреннем узле (ключей - m-1)
const m = 5;
// B-tree
var tree = arrayToBTree([[1, 7, 2, 16, 3, null, null, null, null], [null, 1, null, 2, null, 5, null, 6, null], [null, 9, null, 12, null, null, null, null, null], [null, 18, null, 21, null, null, null, null, null]]);
// highlighted
const highlightNodes = new Set();
const highlightLinks = new Set();
// edge of cube (element/cell of block (node))
const edge = 16;
// cubes info
var cubes;
setNodeCubeInfo();
// graph data
var gData = getGraphData(tree, m, edge);
const elem = document.getElementById("3d-graph");
const Graph = showGraph();

// JSON form of tree
var jsonStr;
updateJsonStr();

function showGraph() {
    return ForceGraph3D()
      (elem)
        // adding data
        .graphData(gData)
        // interaction
        .enableNodeDrag(false)
        // container layout
        .backgroundColor('#050011')
        .showNavInfo(false)
        // links style
        .linkColor('white')
        .linkOpacity(0.3)
        .linkWidth(1)
        .linkDirectionalParticles(link => (highlightLinks.has(link) ? 4 : 0))
        // nodes style
        .nodeAutoColorBy('id')
        .nodeThreeObject(node => getBlock(node));
}

// block (node) like |_|_|_|
function getBlock(node) {
  const count = 2*m-1;
  var offset = (count - 1) / 2 * edge;

  const group = new THREE.Group();
  for (var i = 0; i < count; i++) {
    var cube = getCube(node, i, edge);
    cube.position.x = i*edge - offset;
    cube.position.y = 0;
    cube.position.z = 0;
    group.add(cube);
  }
  return group;
}

// cube (element/cell of block (node)) like |_|, i - number of cube in block
function getCube(node, i, edge) {
  // cube
  const n = getNodeCubeInfo(node.id, i);
  var geometry = new THREE.BoxGeometry(edge, edge, edge);
  var material = new THREE.MeshBasicMaterial({ color: (highlightNodes.has(n) ? 'red' : 'white'), depthWrite: false, 
    transparent: true, opacity: (highlightNodes.has(n) ? 0.8 : (n.indexInBlock % 2 == 0 ? 0.3 : 0.1))});
  var cube = new THREE.Mesh(geometry, material);
  cube.name = n.toString();
  
  // something in cube
  if (node.val[n.indexInBlock]) {
    if (n.indexInBlock % 2 == 1) {
      // number (key)
      const sprite = new SpriteText(node.val[n.indexInBlock].toString());
      sprite.color = node.color;
      sprite.textHeight = 8;
      cube.add(sprite);
      return cube;
    } else {
      // small sphere (link to other block (node))
      const group = new THREE.Group();
      const sphereGeometry = new THREE.SphereGeometry(edge/2*0.5);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: node.color, depthWrite: false, transparent: true, opacity: 0.7});
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      cube.position.x = 0; cube.position.y = 0; cube.position.z = 0;
      group.add(cube);
      sphere.position.x = 0; sphere.position.y = 0; sphere.position.z = 0;
      group.add(sphere);
      return group;
    }
  }
  // cube only for empty cell
  return cube;
}

function setNodeCubeInfo() {
  cubes = new Map();
  for (var [key, value] of tree.entries()) {
    cubes.set(key, new Array(value.length));
    for (var j = 0; j < value.length; j++) {
      cubes.get(key)[j] = {blockIndex: key, indexInBlock: j};
    }
  }
}
  
// for hightlighting
function getNodeCubeInfo(node_id, index) {
  //return {blockIndex: node_id, indexInBlock: index};
  return cubes.get(node_id)[index];
  
}

document.body.appendChild(elem);

// update highlighted
function updateHighlightCube(nodeCube) {
  highlightNodes.clear();
  highlightNodes.add(nodeCube);
  Graph.nodeThreeObject(Graph.nodeThreeObject());
}
function updateHighlightLink(link) {
  highlightLinks.clear();
  highlightLinks.add(link);
  Graph.linkDirectionalParticles(Graph.linkDirectionalParticles());
}
function clearHighlight() {
  highlightNodes.clear();
  highlightLinks.clear();
  Graph.nodeThreeObject(Graph.nodeThreeObject());
  Graph.linkDirectionalParticles(Graph.linkDirectionalParticles());
}

// update JSON form of tree
function updateJsonStr() {
  jsonStr = JSON.stringify(BTreeToArray(tree));
  //jsonStr = JSON.stringify([...tree]);
}

// area with buttons and text field
var thisButtons;
class BTreeButtons extends React.Component {

  constructor(props) {
    super(props);
    this.state = {fieldDisabled: false, randomDisabled: false, 
      insertDisabled: false, setJsonDisabled: false, searchDisabled: (gData.nodes.length < 1), deleteDisabled: (gData.nodes.length < 1), clearDisabled: true, 
      curValue: currentValue, jsonValue: jsonStr, jsonOpen: false, paperOpen: true, controlTextOpen: true, openSuccess: false, openFail: false,
      textSuccess: "", textFail: ""};
    thisButtons = this;

    setTimeout(() => {
      this.setState({controlTextOpen: false});
    }, 5000);
  }

  // on change number field
  handleChange(e) {
    currentValue = parseInt(e.target.value);
    this.setState({curValue: currentValue});
  }
  
  // on change text field
  handleChangeJson(e) {
    jsonStr = e.target.value;
    this.setState({jsonValue: jsonStr});
  }

  // on close success alert
  handleSuccessClose(e, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({openSuccess: false});
  }

  // on close fail alert
  handleFailClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({openFail: false});
  }

  setEnabledAll() {
    thisButtons.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
  }

  // insert new key
  insert() {
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (!currentValue || !Number.isFinite(currentValue)) this.setRandomValue();
    
    if (tree.size < 1) {
      const blockIndex = 'root';
      const index = 1;
      tree.set(blockIndex, new Array(2 * m - 1));
      for (var i = 0; i < tree.get(blockIndex).length; i++) { tree.get(blockIndex)[i] = null; }
      tree.get(blockIndex)[index] = currentValue;

      setNodeCubeInfo();
      gData = getGraphData(tree, m, edge);
      Graph.graphData(gData);
      updateHighlightCube(getNodeCubeInfo(blockIndex, index));
      updateJsonStr();
      thisButtons.setState({textSuccess: "Ключ добавлен!", openSuccess: true});
      thisButtons.setState({jsonValue: jsonStr});
      thisButtons.setEnabledAll();
    } else {
      thisButtons.chooseLeaf(currentValue);
    }
  }

  chooseLeaf(value) {
    thisButtons.leafLoop('root', value);
  }

  leafLoop(index, value) {   
    console.log('leafLoop');
    setTimeout(function() {
      console.log(index);
      const block = tree.get(index);
      console.log(block);
      var link;
      var nodeCube;
      for (var i = 1; i <= block.length; i = i + 2) {
        // get link
        if (i == block.length || block[i] == null || block[i] == undefined || currentValue < block[i]) {
          link = block[i - 1];
          nodeCube = getNodeCubeInfo(index, i - 1);
          updateHighlightCube(nodeCube);
          break; 
        }
        // currentValue is found
        if (currentValue == block[i]) {
          nodeCube = getNodeCubeInfo(index, i);
          updateHighlightCube(nodeCube);
          thisButtons.setState({textFail: "Этот ключ уже есть!", openFail: true});
          thisButtons.setEnabledAll();
          return;
        }
      }
      // tree doesn't contain currentValue
      if (link == null) {
        setTimeout(function() {
          if (thisButtons.isFull(tree.get(index)) == false) { thisButtons.addToBlock(index, currentValue); }
          else { thisButtons.divide(index, currentValue); }

          setNodeCubeInfo();
          gData = getGraphData(tree, m, edge);
          Graph.graphData(gData);
          updateJsonStr();
          thisButtons.setState({textSuccess: "Ключ добавлен!", openSuccess: true});
          thisButtons.setState({jsonValue: jsonStr});
          thisButtons.setEnabledAll();

          return;
        }, 1000);
      } else {
      console.log(link);
      thisButtons.leafLoop(link, value); }
    }, 1000);
  }

  isFull(block) {
    return (block[block.length - 2] != null);
  }

  addToBlock(blockIndex, value) {
    const block = tree.get(blockIndex);
    var copy;
    var ii;
    for (var i = 1; i < block.length; i = i + 2) {
      if (block[i] == null) { block[i] = value; return; }
      if (block[i] > value) { copy = block.slice(i-1, block.length - 2); ii = i; break; }
    }

    block[ii - 1] = null;
    block[ii] = value;
    var j = 0;
    for (var i = ii + 1; i < block.length; i++) {
      block[i] = copy[j];
      j++;
    }
  }

  divide(blockIndex, value) {
    var block = tree.get(blockIndex);
    const newBlockIndex = createUUID();
    const parentIndex = thisButtons.getParent(blockIndex);
    if (m % 2 == 0) { // m - 1
      const ave = m-1;
      const aveValue = block[ave];
      if (value > block[ave]) {
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(ave + 1))); // new right block without value
        block = thisButtons.getNormalBlock(block.slice(0, ave)); // old left block
        thisButtons.addToBlock(newBlockIndex, value); // right block with value
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      } else {
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(0, ave))); // new left block without value
        block = thisButtons.getNormalBlock(block.slice(ave + 1)); // old right block
        thisButtons.addToBlock(newBlockIndex, value); // left block with value
        thisButtons.moveAndInsertLeft(parentIndex, newBlockIndex, aveValue, blockIndex);
      }
    } else { // m, m - 2
      if (value > block[m]) {
        const ave = m;
        const aveValue = block[ave];
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(ave + 1))); // new right block without value
        block = thisButtons.getNormalBlock(block.slice(0, ave)); // old left block
        thisButtons.addToBlock(newBlockIndex, value); // right block with value
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      } else if (value < block[m-2]) {
        const ave = m - 2;
        const aveValue = block[ave];
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(0, ave))); // new left block without value
        block = thisButtons.getNormalBlock(block.slice(ave + 1)); // old right block
        thisButtons.addToBlock(newBlockIndex, value); // left block with value
        thisButtons.moveAndInsertLeft(parentIndex, newBlockIndex, aveValue, blockIndex);
      } else {
        const aveValue = value;
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(m))); // new right block
        block = thisButtons.getNormalBlock(block.slice(0, m)); // old left block
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      }
    }
      
  }

  getNormalBlock(subBlock) {
    const block = new Array(2 * m - 1);
    for (var i = 0; i < subBlock.length; i++) {
      block[i] = subBlock[i];
    }
    for (var i = subBlock.length; i < block.length; i++) {
      block[i] = null;
    }
    return block;
  }

  getParent(blockIndex) {
    if (blockIndex == 'root') return null;
    for (var [index, block] of tree.entries()) {
      for (var i = 0; i < block.length; i = i + 2) {
        if (block[i] == blockIndex) return index;
      }
    }
    return null;
  }

  findChildLinkIndex(parentIndex, childIndex) {
    if (!parentIndex) return null;
    const block = tree.get(parentIndex);
    for (var i = 0; i < block.length; i = i + 2) {
      if (block[i] == childIndex) return i;
    }
    return null;
  }

  moveAndInsertRight(blockIndex, oldLink, newValue, newLink) {
    const parentIndex = thisButtons.getParent(blockIndex);
    const oldLinkIndex = thisButtons.findChildLinkIndex(parentIndex, blockIndex);
    var block = tree.get(blockIndex);
    const tempArr = new Array(block.length + 2);
    const copy = block.slice(oldLinkIndex + 1);
    for (var i = 0; i <= oldLinkIndex; i++) {
      tempArr[i] = block[i];
    }
    tempArr[oldLinkIndex + 1] = newValue;
    tempArr[oldLinkIndex + 2] = newLink;
    for (var i = oldLinkIndex + 3; i < tempArr.length; i++) {
      tempArr[i] = copy[i];
    }
    if (tempArr[tempArr.length - 2] == null) {
      for (var i = 0; i < block.length; i++) {
        block[i] = tempArr[i];
      }
    } else {
      const newBlockIndex = createUUID();
      if (m % 2 == 0) { // m - 1 + 1
        const ave = m;
        const aveValue = block[ave];
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(ave + 1))); // new right block
        block = thisButtons.getNormalBlock(block.slice(0, ave)); // old left block
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      } else { // m + 1, m - 2 + 1 => m - 1
        const ave = m - 1;
        const aveValue = block[ave];
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(ave + 1))); // new right block
        block = thisButtons.getNormalBlock(block.slice(0, ave)); // old left block
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      }
    }
  }

  moveAndInsertLeft(blockIndex, newLink, newValue, oldLink) {
    const parentIndex = thisButtons.getParent(blockIndex);
    const oldLinkIndex = thisButtons.findChildLinkIndex(parentIndex, blockIndex);
    var block = tree.get(blockIndex);
    const tempArr = new Array(block.length + 2);
    const copy = block.slice(oldLinkIndex);
    for (var i = 0; i < oldLinkIndex; i++) {
      tempArr[i] = block[i];
    }
    tempArr[oldLinkIndex] = newLink;
    tempArr[oldLinkIndex + 1] = newValue;
    for (var i = oldLinkIndex + 2; i < tempArr.length; i++) {
      tempArr[i] = copy[i];
    }
    if (tempArr[tempArr.length - 2] == null) {
      for (var i = 0; i < block.length; i++) {
        block[i] = tempArr[i];
      }
    } else {
      const newBlockIndex = createUUID();
      if (m % 2 == 0) { // m - 1 + 1
        const ave = m;
        const aveValue = block[ave];
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(ave + 1))); // new right block
        block = thisButtons.getNormalBlock(block.slice(0, ave)); // old left block
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      } else { // m + 1, m - 2 + 1 => m - 1
        const ave = m - 1;
        const aveValue = block[ave];
        tree.set(newBlockIndex, thisButtons.getNormalBlock(block.slice(ave + 1))); // new right block
        block = thisButtons.getNormalBlock(block.slice(0, ave)); // old left block
        thisButtons.moveAndInsertRight(parentIndex, blockIndex, aveValue, newBlockIndex);
      }
    }
  }


  // search key
  search() {
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (currentValue == null || !Number.isInteger(currentValue)) this.setRandomValue();

    this.searchLoop('root');
  }
  
  // recursive function for search
  searchLoop(index) {  
console.log('searchLoop');       
    setTimeout(function() {
      const block = tree.get(index);
      var link;
      var nodeCube;
      for (var i = 1; i <= block.length; i = i + 2) {
        // get link
        if (i == block.length || block[i] == null || block[i] == undefined || currentValue < block[i]) {
          link = block[i - 1];
          nodeCube = getNodeCubeInfo(index, i - 1);
          updateHighlightCube(nodeCube);
          break; 
        }
        // currentValue is found
        if (currentValue == block[i]) {
          nodeCube = getNodeCubeInfo(index, i);
          updateHighlightCube(nodeCube);
          thisButtons.setState({textSuccess: "Ключ найден!", openSuccess: true});
          thisButtons.setEnabledAll();
          return;
        }
      }
      // tree doesn't contain currentValue
      if (link == null) {
        thisButtons.setState({textFail: "Такого ключа нет!", openFail: true});
        thisButtons.setEnabledAll();
        return;
      }
      thisButtons.searchLoop(link);
    }, 1000);
  }

  // delete node (2-4 steps without search)
  delete() {
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (currentValue == null || !Number.isInteger(currentValue)) this.setRandomValue();
    this.setEnabledAll();
  }

  // clear all hightlighting
  clear() {
    this.setState({clearDisabled: true});
    clearHighlight();
  }

  // set random value in text field for inserting new node / searching / deleting
  setRandomValue() {
    currentValue = Math.round(Math.random() * 100);
    this.setState({curValue: currentValue});
  }

  // quick B-tree
  setDefaultTree() {
    tree = arrayToBTree([[1, 7, 2, 16, 3, null, null, null, null], [null, 1, null, 2, null, 5, null, 6, null], [null, 9, null, 12, null, null, null, null, null], [null, 18, null, 21, null, null, null, null, null]]);
    setNodeCubeInfo();
    gData = getGraphData(tree, m, edge);
    Graph.graphData(gData);
    this.clear();
    updateJsonStr();
    this.setState({jsonValue: jsonStr});
    this.setState({deleteDisabled: false});
    this.setState({searchDisabled: false});
  }

  // tree by JSON form
  setJsonTree() {
    tree = arrayToBTree(JSON.parse(jsonStr));
    //tree = new Map(JSON.parse(jsonStr));
    setNodeCubeInfo();
    gData = getGraphData(tree, m, edge);
    Graph.graphData(gData);
    this.clear();
  }

  // rendering text field and buttons area and 2 alerts
  render() {
    return (
      <ThemeProvider theme={getTheme()}>
      <div>
        <Grid container direction="row" justify="flex-end" alignItems="center" style={{maxWidth: '850px', paddingLeft: '5px', paddingRight: '30px', paddingBottom: '10px'}}>
          <Grid item xs></Grid>
          <Grid item xs={1}><MyIconButtonUp onClick={() => this.setState({paperOpen: true})} visible={!this.state.paperOpen} /></Grid>
        </Grid>

        <Paper className={this.state.paperOpen ? "buttonsPaper" : "hided"}>
        <Grid container direction="column" justify="center" alignItems="center" spacing={1}>
          <Grid container item direction="row" justify="flex-start" alignItems="center" spacing={1}>
            <Grid item><MyNumberField value={this.state.curValue} onChange={(e) => this.handleChange(e)} disabled={this.state.fieldDisabled} /></Grid>
            <Grid item><MyButton name="Случайное значение" color="secondary" onClick={() => this.setRandomValue()} disabled={this.state.randomDisabled} /></Grid>
            <Grid item><MyButton name="Построить дерево по умолчанию" color="secondary" onClick={() => this.setDefaultTree()} disabled={this.state.randomDisabled} /></Grid>
          </Grid>
          <Grid container item direction="row" justify="flex-start" alignItems="center" spacing={1}>
            <Grid item><MyButton name="Вставить узел" onClick={() => this.insert()} disabled={this.state.insertDisabled} /></Grid>
            <Grid item><MyButton name="Найти узел" onClick={() => this.search()} disabled={this.state.searchDisabled} /></Grid>
            <Grid item><MyButton name="Удалить узел" onClick={() => this.delete()} disabled={this.state.deleteDisabled} /></Grid>
            <Grid item><MyButton name="Убрать выделение" onClick={() => this.clear()} disabled={this.state.clearDisabled} /></Grid>
            <Grid item><MyButton name={this.state.jsonOpen ? "Закрыть JSON" : "Открыть JSON"} onClick={() => this.setState({jsonOpen: !this.state.jsonOpen})} /></Grid>
            <Grid item><MyIconButtonDown onClick={() => this.setState({paperOpen: false, jsonOpen: false, controlTextOpen: false})} /></Grid>
          </Grid>
        </Grid>
        </Paper>

        <MyAlert open={this.state.openSuccess} onClose={() => this.handleSuccessClose()} severity="success" text={this.state.textSuccess} />
        <MyAlert open={this.state.openFail} onClose={() => this.handleFailClose()} severity="error" text={this.state.textFail} />

        <MyJsonPaper jsonOpen={this.state.jsonOpen} jsonValue={this.state.jsonValue} onChange={(e) => this.handleChangeJson(e)} onClick={() => this.setJsonTree()} setJsonDisabled={this.state.setJsonDisabled} />

        <MyControlText controlTextOpen={this.state.controlTextOpen} />
      </div>
      </ThemeProvider>
    );
  }
}
ReactDOM.render(<BTreeButtons />, document.getElementById('buttons'));


