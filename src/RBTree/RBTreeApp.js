import React from 'react';
import ReactDOM from 'react-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { ThemeProvider } from '@material-ui/styles';

import MyAlert from '../common/MyAlert.js';
import MyButton from '../common/MyButton.js';
import MyNumberField from '../common/MyNumberField.js';
import MyInfoText from '../common/MyInfoText.js';
import MyControlText from '../common/MyControlText.js';
import MyJsonPaper from '../common/MyJsonPaper.js';
import MyIconButtonUp from '../common/MyIconButtonUp.js';
import MyIconButtonDown from '../common/MyIconButtonDown.js';
import getTheme from '../common/get_theme.js';
import '../common/main.css';

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
        .showNavInfo(false)
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
function updateHighlightNodes2(treeNodes) {
  highlightNodes.clear();
  const {nodes, links} = gData;
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
      curValue: currentValue, jsonValue: jsonStr, jsonOpen: false, paperOpen: true, controlTextOpen: true, openSuccess: false, openFail: false,
      textSuccess: "", textFail: "", text: ""};
    thisRBTreeButtons = this;

    setTimeout(() => {
      this.setState({controlTextOpen: false});
    }, 5000);
  }

  changeText(str) {
    this.setState({text: str});
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

  // insert new node
  insert() {
    this.changeText("");
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (!currentValue || !Number.isFinite(currentValue)) this.setRandomValue();
    const found = tree.Search(currentValue);
    const inserted = tree.add_1(currentValue);
    if (found) {
      this.changeText("Ищем узел " + currentValue + ". Такой узел уже есть. В двоичном дереве поиска и красно-черном дереве все узлы различны, поэтому новый не вставляем");
      updateHighlightNode(inserted);
      this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
      this.setState({textFail: "Такой узел уже есть!", openFail: true});
    } else {
      this.changeText("Ищем узел " + currentValue + ". Такого нет, вставляем красный " + currentValue + " на свободное место");
      gData = getGraphData(tree);
      Graph.graphData(gData);
      updateHighlightNode(inserted);
      setTimeout(() => {
        this.insertLoop(inserted, tree.add_3(inserted, 1));
      }, 5000);
    }
  }

  // recursive function for insert
  insertLoop(node, doneCase) {
    const P = node.Parent;
    const U = node.Uncle;
    const sib = tree.sibling(node);
    const GP = node.GrandParent;
    const LC = node.LeftChild;
    const RC = node.RightChild;
    switch(doneCase) {
      case 1: // root
        this.changeText("1) " + node.Value + " - корень, перекрашиваем его в черный");
        updateHighlightNode(node);
        setTimeout(() => {
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNode(node);
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
          this.setState({textSuccess: "Вставка нового узла завершена!", openSuccess: true});
        }, 5000);
        break;
      case 2: // parent - black
        this.changeText("2) Родитель " + node.Value + " (" + P.Value + ") - черный, ничего не меняем");
        updateHighlightNodes2([node, P]);
        this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
        this.setState({textSuccess: "Вставка нового узла завершена!", openSuccess: true});
        break;
      case 3: // parent and uncle - red
        this.changeText("Родитель (" + P.Value + ") и дядя (" + U.Value + ") узла " + node.Value + " - красные, перекрашиваем их в черный, а деда (" + GP.Value + ") в красный, затем выполняем 1) для деда");
        updateHighlightNodes2([node, P, U, GP]);
        setTimeout(() => {
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNodes2([node, P, U, GP]);
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          setTimeout(() => {
            thisRBTreeButtons.insertLoop(GP, tree.add_3(GP, 1));
          }, 5000);
        }, 5000);
        break;
      case 41: // parent - red, uncle - not red, right-left node
        sib ? this.changeText("4.1) Родитель узла " + node.Value + " (" + LC.Value + ") - красный, но дядя (" + sib.Value + ") - черный, " + node.Value + " - правый сын левого сына, выполняем малое левое вращение, затем 5) для " + LC.Value) : this.changeText("4.1) Родитель узла " + node.Value + " (" + LC.Value + ") - красный, но дяди нет, " + node.Value + " - правый сын левого сына, выполняем малое левое вращение, затем 5) для " + LC.Value);
        updateHighlightNodes2([node, LC]);
        setTimeout(() => {
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNodes2([node, LC]);
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          setTimeout(() => {
            thisRBTreeButtons.insertLoop(LC, tree.add_3(LC, 5));
          }, 5000);
        }, 5000);
        break;
      case 42: // parent - red, uncle - not red, left-right node
        sib ? this.changeText("4.2) Родитель узла " + node.Value + " (" + RC.Value + ") - красный, но дядя (" + sib.Value + ") - черный, " + node.Value + " - левый сын правого сына, выполняем малое правое вращение, затем 5) для " + RC.Value) : this.changeText("4.2) Родитель узла " + node.Value + " (" + RC.Value + ") - красный, но дяди нет, " + node.Value + " - левый сын правого сына, выполняем малое правое вращение, затем 5) для " + RC.Value);
        updateHighlightNodes2([node, RC]);
        setTimeout(() => {
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNodes2([node, RC]);
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          setTimeout(() => {
            thisRBTreeButtons.insertLoop(RC, tree.add_3(RC, 5));
          }, 5000);
        }, 5000);
        break;
      case 51: // parent - red, uncle - not red, left-left node
        sib.RC ? this.changeText("5.1) Родитель узла " + node.Value + " (" + P.Value + ") - красный, но дядя (" + sib.RC.Value + ") - черный, " + node.Value + " - левый сын левого сына. Выполняем большое правое вращение и меняем цвета " + P.Value + " (красный на черный) и " + sib.Value + " (черный на красный)") : this.changeText("5.1) Родитель узла " + node.Value + " (" + P.Value + ") - красный, но дяди нет, " + node.Value + " - левый сын левого сына. Выполняем большое правое вращение и меняем цвета " + P.Value + " (красный на черный) и " + sib.Value + " (черный на красный)");
        updateHighlightNodes2([node, P, sib]);
        setTimeout(() => {
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNodes2([node, P, sib]);
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
          this.setState({textSuccess: "Вставка нового узла завершена!", openSuccess: true});
        }, 5000);
        break;
      case 52: // parent - red, uncle - not red, right-right node
        sib.LC ? this.changeText("5.2) Родитель узла " + node.Value + " (" + P.Value + ") - красный, но дядя (" + sib.LC.Value + ") - черный, " + node.Value + " - правый сын правого сына. Выполняем большое левое вращение и меняем цвета " + P.Value + " (красный на черный) и " + sib.Value + " (черный на красный)") : this.changeText("5.2) Родитель узла " + node.Value + " (" + P.Value + ") - красный, но дяди нет, " + node.Value + " - правый сын правого сына. Выполняем большое левое вращение и меняем цвета " + P.Value + " (красный на черный) и " + sib.Value + " (черный на красный)");
        updateHighlightNodes2([node, P, sib]);
        setTimeout(() => {
          gData = getGraphData(tree);
          Graph.graphData(gData);
          updateHighlightNodes2([node, P, sib]);
          updateJsonStr();
          this.setState({jsonValue: jsonStr});
          this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
          this.setState({textSuccess: "Вставка нового узла завершена!", openSuccess: true});
        }, 5000);
        break;
      default:
        break;
    }
  }

  // search node (steps = path to node)
  search() {
    this.changeText("");
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, setJsonDisabled: true, searchDisabled: true, deleteDisabled: true, clearDisabled: true});
    if (currentValue == null || !Number.isInteger(currentValue)) this.setRandomValue();
    const {nodes, links} = gData;
    var found = tree.Root;
    if (found) {
      updateHighlightNode2(found, nodes);
      this.changeText("Начинаем поиск узла " + currentValue + " с корня " + found.Value);
    } else {
      this.changeText("Дерево пустое");
    }
    this.searchLoop(found, nodes);
  }
  
  // recursive function for search
  searchLoop(found, nodes) {         
    setTimeout(function() {
      const parentVal = found ? found.Value : null;
      found = tree.search_1(found, currentValue);
      if (found) updateHighlightNode2(found, nodes);

      if (found == null) {
        if (!parentVal) {
          thisRBTreeButtons.changeText("Дерево пустое");
        } else if (parentVal && parentVal < currentValue) {
          thisRBTreeButtons.changeText(currentValue + " больше " + parentVal + ", но у " + parentVal + " нет правого сына");
        } else {
          thisRBTreeButtons.changeText(currentValue + " меньше " + parentVal + ", но у " + parentVal + " нет левого сына");
        }
        thisRBTreeButtons.setState({textFail: "Такого узла нет!", openFail: true});
        thisRBTreeButtons.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
      } else {
        if (parentVal < currentValue) {
          thisRBTreeButtons.changeText(currentValue + " больше " + parentVal + ", ищем в правом поддереве");
        } else {
          thisRBTreeButtons.changeText(currentValue + " меньше " + parentVal + ", ищем в левом поддереве");
        }

        if (currentValue == found.Value) {
          thisRBTreeButtons.setState({textSuccess: "Узел найден!", openSuccess: true});
          thisRBTreeButtons.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, setJsonDisabled: false, searchDisabled: false, deleteDisabled: false, clearDisabled: false});
        } else {
          thisRBTreeButtons.searchLoop(found, nodes);
        }
      }
    }, 3000);
  }

  // delete node (2-4 steps without search)
  delete() {
    this.changeText("");
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
    this.changeText("");
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
      <ThemeProvider theme={getTheme()}>
      <div>
        <Grid container direction="row" justify="flex-end" alignItems="center" style={{maxWidth: '850px', paddingLeft: '5px', paddingRight: '30px', paddingBottom: '10px'}}>
          <Grid item xs><MyInfoText text={this.state.text} /></Grid>
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
ReactDOM.render(<RBTreeButtons />, document.getElementById('buttons'));


