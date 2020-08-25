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
import getGraphData from './MinBinHeap_to_graph_data.js';
import graphToHeap from './graph_data_to_MinBinHeap.js';

// value in text field
var currentValue = 5;
var tree = [2, 4, 9, 10, 5, 20, 13, 11, 15, 7];
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
        .backgroundColor('#050020')
        .showNavInfo(false)
        // links style
        .linkColor('white')
        .linkOpacity(0.3)
        .linkWidth(1)
        .linkDirectionalParticles(link => (highlightLinks.has(link) ? 8 : 0))
        // nodes style
        .nodeAutoColorBy('id')
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
function updateHighlight(hNodes, hLinks) {
  const {nodes, links} = gData;
  highlightNodes.clear();
  hNodes.forEach(node => highlightNodes.add(node));
  Graph.nodeThreeObject(Graph.nodeThreeObject());
  highlightLinks.clear();
  hLinks.forEach(link => highlightLinks.add(links.find(l => (l.target == link.target))));
  Graph.linkDirectionalParticles(Graph.linkDirectionalParticles());
}
function clearHighlight() {
  highlightNodes.clear();
  Graph.nodeThreeObject(Graph.nodeThreeObject());
  highlightLinks.clear();
  Graph.linkDirectionalParticles(Graph.linkDirectionalParticles());
}

// update JSON form of tree
function updateJsonStr() {
  jsonStr = JSON.stringify(tree);
}

// area with buttons and text field
var thisButtons;
class HeapButtons extends React.Component {

  constructor(props) {
    super(props);
    this.state = {fieldDisabled: false, randomDisabled: false, setJsonDisabled: false, jsonValue: jsonStr, jsonOpen: false, paperOpen: true, controlTextOpen: true,
      insertDisabled: false, deleteDisabled: (gData.nodes.length < 1), clearDisabled: true, 
      curValue: currentValue, openSuccess: false, openFail: false,
      textSuccess: "", textFail: "", text: ""};
    thisButtons = this;
    
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

  // delete min node
  deleteMin() {
    this.clear();
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, deleteDisabled: true, clearDisabled: true,  setJsonDisabled: true});

    const {nodes, links} = gData;
    updateHighlight([nodes[0], nodes[nodes.length - 1]], []);
    this.changeText("В куче наименьший узел - корень " + nodes[0].val);
    setTimeout(() => {
      this.changeText("Меняем местами корень " + nodes[0].val + " и правый нижний лист " + nodes[nodes.length - 1].val);
      nodes[0].val = nodes[nodes.length - 1].val;
      nodes.length = nodes.length - 1;
      if (links.length > 0) links.length = links.length - 1;
      updateHighlight([gData.nodes[0]], []);
      this.down(nodes, 0);
    }, 2000);
  }

  down(A, i) {
    setTimeout(() => {
      const left = 2*i+1;
      const right = 2*i+2;
      var min = i;
      var str;
      if ((left < A.length) && (A[left].val < A[min].val)) {
        min = left;
        str = "левый";
      }
      if ((right < A.length) && (A[right].val < A[min].val)) {
        min = right;
        str = "правый";
      }
      if (min != i) {
        this.changeText("Спуск: " + A[i].val + " и его " + str + " (наименьший) сын " + A[min].val + " поменялись местами");
        updateHighlight([A[i], A[min]], [{source: A[i], target: A[min]}]);
        const v = A[i].val;
        A[i].val = A[min].val;
        A[min].val = v;
        Graph.graphData(gData);
        Graph.nodeThreeObject(Graph.nodeThreeObject());
        thisButtons.down(A, min);
      } else {
        if ((left < A.length) && (right < A.length)) {
          this.changeText("Спуск закончен: " + A[i].val + " не больше своих детей " + A[left].val + " и " + A[right].val);
        } else if (left < A.length) {
          this.changeText("Спуск закончен: " + A[i].val + " не больше своего сына " + A[left].val);
        } else if (right < A.length) {
          this.changeText("Спуск закончен: " + A[i].val + " не больше своего сына " + A[right].val);
        } else {
          this.changeText("Спуск закончен: " + A[i].val + " - лист");
        }
        updateHighlight([A[i]], []);
        tree = graphToHeap(gData);
        updateJsonStr();
        this.setState({jsonValue: jsonStr});
        this.setState({textSuccess: "Минимальный узел удален!", openSuccess: true});
        this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, deleteDisabled: (gData.nodes.length < 1), clearDisabled: false,  setJsonDisabled: false});
      }
    }, 4000);
  }

  // insert new node
  insert() {
    this.clear();
    this.setState({fieldDisabled: true, randomDisabled: true, insertDisabled: true, deleteDisabled: true, clearDisabled: true,  setJsonDisabled: true});
    if (!currentValue || !Number.isFinite(currentValue)) this.setRandomValue();
    const {nodes, links} = gData;
    tree = [...nodes].map(node => node.val);
    tree.push(currentValue);
    gData = getGraphData(tree);
    Graph.graphData(gData);
    const parent = Math.floor((gData.nodes.length-1-1)/2);
    if (parent >= 0) {
      updateHighlight([gData.nodes[gData.nodes.length - 1]], []);
      this.changeText("Вставляем новый узел " + currentValue + " в \"первое\" пустое место");
      this.up(gData.nodes, gData.nodes.length-1);
    } else {
      updateHighlight([gData.nodes[gData.nodes.length-1]], []);
      this.changeText("Дерево пустое - вставляем новый узел " + currentValue + " на место корня");
      tree = graphToHeap(gData);
      updateJsonStr();
      this.setState({jsonValue: jsonStr});
      this.setState({textSuccess: "Вставка нового узла завершена!", openSuccess: true});
      this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, deleteDisabled: false, clearDisabled: false,  setJsonDisabled: false});
    }
  }

  up(A, i) {
    setTimeout(() => {
    const parent = Math.floor((i-1)/2);
    if ((parent >= 0) && (A[parent].val > A[i].val)) {
      updateHighlight([A[i], A[parent]], [{source: A[parent], target: A[i]}]);
      this.changeText("Узел всплывает: меняем местами " + A[i].val + " и его родителя " + A[parent].val + " (т.к. он больше сына)");
      const v = A[i].val;
      A[i].val = A[parent].val;
      A[parent].val = v;
      Graph.graphData(gData);
      Graph.nodeThreeObject(Graph.nodeThreeObject());
      i = parent;
      thisButtons.up(A, i);
    } else {
      if (parent < 0) {this.changeText(A[i].val + " - корень, дальше всплывать некуда"); updateHighlight([A[i]], []);}
      else {this.changeText("Узел " + A[i].val + " не меньше родителя " + A[parent].val + " - он больше не всплывает"); updateHighlight([A[i], A[parent]], [{source: A[parent], target: A[i]}]);}
      tree = graphToHeap(gData);
      updateJsonStr();
      this.setState({jsonValue: jsonStr});
      this.setState({textSuccess: "Вставка нового узла завершена!", openSuccess: true});
      this.setState({fieldDisabled: false, randomDisabled: false, insertDisabled: false, deleteDisabled: false, clearDisabled: false,  setJsonDisabled: false});
    }
    }, 3000);
  }

  // clear all hightlighting
  clear() {
    this.setState({clearDisabled: true});
    clearHighlight();
    this.changeText("");
  }

  // set random value in text field for inserting new node / searching / deleting
  setRandomValue() {
    currentValue = Math.round(Math.random() * 100);
    this.setState({curValue: currentValue});
  }

  // quick tree
  setDefaultTree() {
    tree = [2, 4, 9, 10, 5, 20, 13, 11, 15, 7];
    updateJsonStr();
    this.setState({jsonValue: jsonStr});
    gData = getGraphData(tree);
    Graph.graphData(gData);
    this.clear();
    this.setState({deleteDisabled: false});
  }

  // tree by JSON form
  setJsonTree() {
    tree = JSON.parse(jsonStr);
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
            <Grid item><MyButton name="Удалить минимальный узел" onClick={() => this.deleteMin()} disabled={this.state.deleteDisabled} /></Grid>
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
ReactDOM.render(<HeapButtons />, document.getElementById('buttons'));


