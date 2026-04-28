const fs = require('fs');
const filePath = 'src/pages/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const searchStr = '<ProductCard \n                                     key={item.id} \n                                     item={item} \n                                     updateItem={updateItem} \n                                     updateItemFields={updateItemFields}\n                                     onEdit={(it) => { setEditingItem(it); setIsProductModalOpen(true); }}\n                                     onDelete={handleDeleteProduct}\n                                   />';

const replaceStr = '<ProductCard \n                                     key={item.id} \n                                     item={item} \n                                     updateItem={updateItem} \n                                     updateItemFields={updateItemFields}\n                                     onEdit={(it) => { setEditingItem(it); setIsProductModalOpen(true); }}\n                                     onDelete={handleDeleteProduct}\n                                     totalPerdas={getItemPerdas(item.id)}\n                                     totalTransferencias={getItemTransf(item.id)}\n                                   />';

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('OK - ProductCard props updated');
} else {
  console.log('NOT FOUND - trying alternate...');
  // Try finding the pattern differently
  const idx = content.indexOf('onDelete={handleDeleteProduct}\n                                   />');
  if (idx !== -1) {
    console.log('Found at index:', idx);
    console.log('Context:', JSON.stringify(content.substring(idx - 200, idx + 100)));
  }
}
