import React from 'react';
import ReactDOM from 'react-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import MyAlert from '../common/MyAlert.js';
import MyButton from '../common/MyButton.js';
import MyNumberField from '../common/MyNumberField.js';
import MyTextField from '../common/MyTextField.js';

import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import arrayToRBTree from './Array_to_RBTree.js';
import getGraphData from './RBTree_to_graph_data2.js';
import RBTreeToMap from './RBTree_to_map.js';
import mapToRBTree from './map_to_RBTree.js';

// value in text field
var currentValue = 5;
// red-black tree
var tree = arrayToRBTree([15, 100, 10, 65, 33, 2, 14, 65, 123, 3, 12, 17]);
// JSON form of tree
var jsonStr;
updateJsonStr();
// highlighted
const highlightNodes = new Set();
const highlightLinks = new Set();
// graph data
var gData = getGraphData(tree);
const elem = document.getElementById("3d-graph");
const Graph = showGraph();

function showGraph() {
    return ForceGraph3D()
      (elem)
        // adding data
        .graphData(gData)
        // interaction
        .enableNodeDrag(false)
        // container layout
        .backgroundColor('#115293')
        // links style
        .linkColor(link => link.color)
        .linkOpacity(0.3)
        .linkWidth(1)
        .linkDirectionalParticles(link => (highlightLinks.has(link) ? 4 : 0))
        // nodes style
        .nodeThreeObject(node => {
          const obj = new THREE.Mesh(
            new THREE.SphereGeometry((highlightNodes.has(node) ? 16 : 8), 32),
            new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: (highlightNodes.has(node) ? 0.3 : 0.1) })
          );
          const sprite = new SpriteText(node.val.toString());
          sprite.color = node.color;
          sprite.textHeight = 8;
          obj.add(sprite);
          return obj;
        });
}
document.body.appendChild(elem);

// update highlighted
function updateHighlightNode(treeNode) {
  highlightNodes.clear();
  const {nodes, links} = gData;
  highlightNodes.add(nodes.find(n => (n.id == treeNode.Value)));
  Graph.nodeThreeObject(Graph.nodeThreeObject());
}
function updateHighlightNode2(treeNode, nodes) {
  highlightNodes.clear();
  highlightNodes.add(nodes.find(n => (n.id == treeNode.Value)));
  Graph.nodeThreeObject(Graph.nodeThreeObject());
}
function updateHighlightNode3(node) {
  highlightNodes.add(node);
  Graph.nodeThreeObject(Graph.nodeThreeObject());
}
function updateHighlightNodes(treeNodes, nodes) {
  highlightNodes.clear();
  treeNodes.forEach(treeNode => highlightNodes.add(nodes.find(n => (n.id == treeNode.Value))));
  Graph.nodeThreeObject(Graph.nodeThreeObject());
}
function clearHighlightNodes() {
  highlightNodes.clear();
  Graph.nodeThreeObject(Graph.nodeThreeObject());
}

// update JSON form of tree
function updateJsonStr() {
  jsonStr = JSON.stringify([...RBTreeToMap(tree)]);
}

// area with buttons and text field
var thisRBTreeButtons;
class RBTreeButtons extends React.Component {

  constructor(props) {
    super(props);
    this.state = {fieldDisabled: false, randomDisabled: false, 
      insertDisabled: false, setJsonDisabled: false, searchDisabled: (gData.nodes.length < 1), deleteDisabled: (gData.nodes.length < 1), clearDisabled: true, 
      curValue: currentValue, jsonValue: jsonStr, jsonOpen: false, openSuccess: false, openFail: false,
      textSuccess: "", textFail: ""};
    thisRBTreeButtons = this;
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

  // insert new node (2 steps)
  insert() { 
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (!currentValue || !Number.isFinite(currentValue)) this.setRandomValue();
    const inserted = tree.add_1(currentValue);
    gData = getGraphData(tree);
    Graph.graphData(gData);
    updateHighlightNode(inserted);

    setTimeout(() => {
      tree.add_2(inserted);
      gData = getGraphData(tree);
      Graph.graphData(gData);
      updateHighlightNode(inserted);
      updateJsonStr();
      this.setState({jsonValue: jsonStr});
      this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
    }, 1000);
  }

  // search node (steps = path to node)
  search() {
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (currentValue == null || !Number.isInteger(currentValue)) this.setRandomValue();
    const {nodes, links} = gData;
    var found = tree.Root;
    if (found) { updateHighlightNode2(found, nodes); }
    this.searchLoop(found, nodes);
  }
  
  // recursive function for search
  searchLoop(found, nodes) {         
    setTimeout(function() {   
      found = tree.search_1(found, currentValue);
      if (found) updateHighlightNode2(found, nodes);

      if (found == null) {
        thisRBTreeButtons.setState({textFail: "Такого узла нет!", openFail: true});
        thisRBTreeButtons.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
      } else if (currentValue == found.Value) {
        thisRBTreeButtons.setState({textSuccess: "Узел найден!", openSuccess: true});
        thisRBTreeButtons.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
      } else {
        thisRBTreeButtons.searchLoop(found, nodes);
      }
    }, 1000);
  }

  // delete node (2-4 steps without search)
  delete() {
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (currentValue == null || !Number.isInteger(currentValue)) this.setRandomValue();
    var deleted = tree.remove_search(currentValue);
    if (deleted) {
      updateHighlightNode(deleted);
      setTimeout(() => {
        if (tree.remove_is_two(deleted)) {
          const {nodes, links} = gData;
          const delNode = nodes.find(n => (n.id == deleted.Value));
          var repl = tree.remove_two(deleted);
          updateHighlightNode2(repl, nodes);
          updateHighlightNode3(delNode);
          delNode.val = repl.Value;
          Graph.graphData(Graph.graphData());
          
          setTimeout(() => {
            if (tree.remove_is_leaf(repl)) {
              tree.remove_leaf(repl);
              gData = getGraphData(tree);
              Graph.graphData(gData);
              clearHighlightNodes();
              this.setState({textSuccess: "Узел успешно удален!", openSuccess: true});
              updateJsonStr();
              this.setState({jsonValue: jsonStr});
              this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
            } else {
              var sub = tree.remove_one_1(repl);
              gData = getGraphData(tree);
              Graph.graphData(gData);
              updateHighlightNode(sub);
              setTimeout(() => {
                tree.remove_one_2(repl, sub);
                gData = getGraphData(tree);
                Graph.graphData(gData);
                updateHighlightNode(sub);
                this.setState({textSuccess: "Узел успешно удален!", openSuccess: true});
                updateJsonStr();
                this.setState({jsonValue: jsonStr});
                this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
              }, 3000);
            }
          }, 3000);
        } else if (tree.remove_is_leaf(deleted)) {
          tree.remove_leaf(deleted);
          gData = getGraphData(tree);
          Graph.graphData(gData);
          clearHighlightNodes();
          this.setState({textSuccess: "Узел успешно удален!", openSuccess: true});
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
        } else {
          var sub = tree.remove_one_1(deleted);
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNode(sub);
          setTimeout(() => {
            tree.remove_one_2(deleted, sub);
            gData = getGraphData(tree);
            Graph.graphData(gData);
            updateHighlightNode(sub);
            this.setState({textSuccess: "Узел успешно удален!", openSuccess: true});
            updateJsonStr();
            this.setState({jsonValue: jsonStr});
            this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
          }, 3000);
        }
      }, 3000);
    } else {
      this.setState({textFail: "Такого узла нет!", openFail: true});
      this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
    }
  }

  // clear all hightlighting
  clear() {
    this.setState({clearDisabled: true});
    clearHighlightNodes();
  }

  // set random value in text field for inserting new node / searching / deleting
  setRandomValue() {
    currentValue = Math.round(Math.random() * 100);
    this.setState({curValue: currentValue});
  }

  // quick red-black tree
  setDefaultTree() {
    tree = arrayToRBTree([15, 100, 10, 65, 33, 2, 14, 65, 123, 3, 12, 17]);
    updateJsonStr();
    this.setState({jsonValue: jsonStr});
    gData = getGraphData(tree);
    Graph.graphData(gData);
    this.clear();
    this.setState({deleteDisabled: false});
    this.setState({searchDisabled: false});
  }

  // tree by JSON form
  setJsonTree() {
    var map = new Map(JSON.parse(jsonStr));
    tree = mapToRBTree(map);
    gData = getGraphData(tree);
    Graph.graphData(gData);
    this.clear();
  }

  // rendering text field and buttons area and 2 alerts
  render() {
    return (
      <div>
        <Paper style={{ marginBottom: '1%', padding: 15, maxWidth: 800 }} elevation={3}>
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
          </Grid>
        </Grid>
        </Paper>
        <MyAlert open={this.state.openSuccess} onClose={() => this.handleSuccessClose()} severity="success" text={this.state.textSuccess} />
        <MyAlert open={this.state.openFail} onClose={() => this.handleFailClose()} severity="error" text={this.state.textFail} />
        <Paper elevation={3} style={this.state.jsonOpen ? {display: 'block', padding: 15, marginBottom: '1%'} : {display: 'none', padding: 15, marginBottom: '1%'}}>
          <Grid container direction="column" justify="center" alignItems="flex-start" spacing={1}>
            <Grid item style={{width: '100%'}}><MyTextField value={this.state.jsonValue} onChange={(e) => this.handleChangeJson(e)} /></Grid>
            <Grid item><MyButton name="Визуализировать" onClick={() => this.setJsonTree()} disabled={this.state.setJsonDisabled} /></Grid>
          </Grid>
        </Paper>
        <Typography variant="caption" color='secondary' gutterBottom style={{paddingTop: '1%', paddingBottom: '1%'}}>
          левая кнопка мыши - вращение, правая - передвижение камеры, колесико - приближение/отдаление камеры
        </Typography>
      </div>
    );
  }
}
ReactDOM.render(<RBTreeButtons />, document.getElementById('buttons'));


