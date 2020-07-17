import React from 'react';
import ReactDOM from 'react-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';

import MyAlert from '../common/MyAlert.js';
import MyButton from '../common/MyButton.js';
import MyTextField from '../common/MyTextField.js';

import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

import findRootKey from './find_root_key.js';
import getGraphData from './map_of_children_to_graph_data.js';

// Some tree (array)
var treeArr = [[18, [3, 10, 99]], [3, [1, 6]], [10, [14, 'M']], [6, [4, 7, 'a']], [14, [13]], [1, []], [4, []], [7, []], [13, []], [99, [0]], [0, ['xx']], ['a', []], ['xx', []], ['M', []]];
// Some tree (map)
var tree = new Map(treeArr);
// JSON form of tree
var jsonStr;
updateJsonStr();
// root key
var rootkey = findRootKey(tree);
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
        .onNodeClick(null)
        // container layout
        .backgroundColor('#050011')
        // dag mode
        .dagMode('td')
        .dagLevelDistance(50)
        // links style
        .linkColor('white')
        .linkOpacity(0.3)
        .linkWidth(1)
        .linkDirectionalParticles(link => (highlightLinks.has(link) ? 4 : 0))
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

// updating highlighted nodes and links
function updateHighlighted() {
  Graph
    .nodeThreeObject(Graph.nodeThreeObject())
    .linkDirectionalParticles(Graph.linkDirectionalParticles());
}

// update highlight sets
function updateHighlight(hNodes, hLinks) {
  const {nodes, links} = gData;
  highlightNodes.clear();
  hNodes.forEach(node => highlightNodes.add(node));
  highlightLinks.clear();
  hLinks.forEach(link => highlightLinks.add(links.find(l => (l.target == link.target))));
  updateHighlighted();
}

// clear highlight sets
function clearHighlight() {
  highlightNodes.clear();
  highlightLinks.clear();
  updateHighlighted();
}

// update JSON form of tree
function updateJsonStr() {
  jsonStr = JSON.stringify([...tree]);
}
    
// area with buttons and text field
var thisButtons;
class AnyTreeButtons extends React.Component {

  constructor(props) {
    super(props);
    this.state = { newDisabled: false, disabled: null, setJsonDisabled: false, clearDisabled: true, jsonValue: jsonStr, jsonOpen: false, text: "",
      openSuccess: false, openFail: false, textSuccess: "", textFail: ""};
    thisButtons = this;
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

  // turn on calculate depth of node mode
  depth() {
    this.setState({disabled: 'depth', setJsonDisabled: true, newDisabled: true});
    this.clear();
    // find depth when user click on any node
    Graph.onNodeClick(n => { this.findDepthPath(n.id); updateHighlighted(); this.setState({clearDisabled: false}); });
  }
  
  // finding depth
  findDepthPath(id) {
    const {nodes, links} = Graph.graphData();
    this.clear();
    var key = id;
    var node = nodes.find(n => (n.id == key));
    highlightNodes.add(node);
    var link;
    while (key != rootkey) {
      link = links.find(l => (l.target.id == key));
      highlightLinks.add(link);
      key = link.source.id;
      node = nodes.find(n => (n.id == key));
      highlightNodes.add(node);
    }
    const curText = "Глубина узла - " + highlightLinks.size.toString();
    this.setState({text: curText});
  }

  // turn on calculate height of node mode
  height() {
    this.setState({disabled: 'height', setJsonDisabled: true, newDisabled: true});
    this.clear();
    // find height when user click on any node
    Graph.onNodeClick(n => { this.findHeightPath(n); updateHighlighted(); this.setState({clearDisabled: false}); });
  }
  
  // finding height
  findHeightPath(node) {
    const {nodes, links} = Graph.graphData();
    this.clear();
    highlightNodes.add(node);

    const tempSet = this.findHeight(node, null, links);
    for (var l of tempSet) {
      highlightLinks.add(l);
      highlightNodes.add(l.target);
    }
    
    const curText = "Высота узла - " + highlightLinks.size.toString();
    this.setState({text: curText});
  }

  findHeight(node, parentLink, links) {
    var tempSet;
    var set = new Set();
    var max = set.size;
    for (var link of links) {
      if (link.source == node) {
        tempSet = thisButtons.findHeight(link.target, link, links);
        if (tempSet.size > max) {
          max = tempSet.size;
          set = tempSet;
        }
      }
    }
    if (parentLink) set.add(parentLink);
    return set;
  }
  
  // set null on click function on nodes
  cancel() {
    // nothing is highlighted
    this.clear();
    // all algo buttons works
    this.setState({disabled: null, setJsonDisabled: false, newDisabled: false});
    // nothing happens when user click on any node
    Graph.onNodeClick(null);
  }

  // clear all hightlighting
  clear() {
    this.setState({clearDisabled: true});
    clearHighlight();
    // clear text label
    this.setState({text: ""});
  }

  // quick tree
  setDefaultTree() {
    treeArr = [[18, [3, 10, 99]], [3, [1, 6]], [10, [14, 'M']], [6, [4, 7, 'a']], [14, [13]], [1, []], [4, []], [7, []], [13, []], [99, [0]], [0, ['xx']], ['a', []], ['xx', []], ['M', []]];
    tree = new Map(treeArr);
    rootkey = findRootKey(tree);
    updateJsonStr();
    this.setState({jsonValue: jsonStr});
    gData = getGraphData(tree);
    Graph.graphData(gData);
    this.clear();
  }

  // tree by JSON form
  setJsonTree() {
    tree = new Map(JSON.parse(jsonStr));
    gData = getGraphData(tree);
    Graph.graphData(gData);
    this.clear();
  }

  // rendering text field and buttons area and 2 alerts
  render() {
    return (
      <div>
        <Typography variant="button" color='secondary' gutterBottom style={{position: 'relative', left: '0%', bottom: '10px'}}>
          {this.state.text}
        </Typography>
        <Card style={{ marginBottom: 12 }} elevation={3}>
          <CardActions>
            <MyButton name="Построить дерево по умолчанию" color="secondary" onClick={() => this.setDefaultTree()} style={!this.state.newDisabled ? {display: 'block'} : {display: 'none'}} />
            <MyButton name="Глубина узла" onClick={() => this.depth()} disabled={this.state.disabled == 'depth'} />
            <MyButton name="Высота узла" onClick={() => this.height()} disabled={this.state.disabled == 'height'} />
            <MyButton name="Убрать выделение" color="secondary" onClick={() => this.clear()} style={!this.state.clearDisabled ? {display: 'block'} : {display: 'none'}} />
            <MyButton name="Сбросить режим" color="secondary" onClick={() => this.cancel()} 
              style={this.state.disabled == 'depth' || this.state.disabled == 'height' ? {display: 'block'} : {display: 'none'}} />
            <MyButton name={this.state.jsonOpen ? "Закрыть JSON" : "Открыть JSON"} onClick={() => this.setState({jsonOpen: !this.state.jsonOpen})} />
          </CardActions>
        </Card>
        <MyAlert open={this.state.openSuccess} onClose={() => this.handleSuccessClose()} severity="success" text={this.state.textSuccess} />
        <MyAlert open={this.state.openFail} onClose={() => this.handleFailClose()} severity="error" text={this.state.textFail} />
        <Card elevation={3} style={this.state.jsonOpen ? {display: 'block'} : {display: 'none'}}>
          <CardContent>
            <MyTextField value={this.state.jsonValue} onChange={(e) => this.handleChangeJson(e)} />
          </CardContent>
          <CardActions> 
            <MyButton name="Визуализировать" onClick={() => this.setJsonTree()} disabled={this.state.setJsonDisabled} />
          </CardActions>
        </Card>
        <Typography variant="caption" color='secondary' gutterBottom style={{position: 'relative', left: '0%', top: '5px', bottom: '5px'}}>
          левая кнопка мыши - вращение, правая - передвижение камеры, колесико - приближение/отдаление камеры
        </Typography>
      </div>
    );
  }
}
ReactDOM.render(<AnyTreeButtons />, document.getElementById('buttons'));
