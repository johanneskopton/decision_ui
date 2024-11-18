export default function(model) {
  let target_interfaces = new Set();
  model.connections.forEach(e => {
    target_interfaces.add(e.to);
  });
  model.nodes.forEach(node => {
    node.interfaces.forEach(node_interface => {
      if (
        node_interface[0] == "Result" ||
        target_interfaces.has(node_interface[1].id)
      ) {
        delete node_interface[1].value;
      }
    });
    node.options.forEach(node_option => {
      if (node_option[0] == "ValueText") {
        delete node_option[1];
      }
    });
  });
  return model;
}
