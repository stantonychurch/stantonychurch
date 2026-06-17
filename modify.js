const fs = require('fs');
const path = require('path');
const dir = 'mobile/app/(member)';
const files = fs.readdirSync(dir).filter(f => f !== '_layout.jsx' && f !== 'home.jsx' && f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add DrawerContext import
  if (!content.includes('DrawerContext')) {
    content = content.replace(/import \{.*?\} from 'expo-router';/, match => match + `\nimport { DrawerContext } from './_layout';`);
    if (!content.includes('DrawerContext')) {
      content = content.replace(/(import .*?;)/, match => match + `\nimport { DrawerContext } from './_layout';`);
    }
  }

  // 2. Add useContext
  if (!content.includes('useContext')) {
    content = content.replace(/import \{ useEffect, useState \} from 'react';/, "import { useEffect, useState, useContext } from 'react';");
    content = content.replace(/import \{ useState \} from 'react';/, "import { useState, useContext } from 'react';");
  }

  // 3. Extract toggleDrawer inside component
  const compRegex = /export default function [a-zA-Z]+\(\) \{/;
  if (compRegex.test(content) && !content.includes('toggleDrawer')) {
    content = content.replace(compRegex, match => match + '\n  const { toggleDrawer } = useContext(DrawerContext);');
  }

  // 4. Replace back button with hamburger
  content = content.replace(
    /<TouchableOpacity onPress=\{\(\) => router\.back\(\)\} style=\{styles\.backBtnSmall\}>\s*<Text style=\{styles\.backTextSmall\}>← Home<\/Text>\s*<\/TouchableOpacity>/g,
    '<TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}><Text style={styles.menuBtnText}>☰</Text></TouchableOpacity>'
  );

  // 5. Add styles if missing
  if (content.includes('styles = StyleSheet.create({') && !content.includes('menuBtn: {')) {
    content = content.replace(/styles = StyleSheet\.create\(\{/, "styles = StyleSheet.create({\n  menuBtn: { padding: 4, marginRight: 8, alignSelf: 'center' },\n  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },");
  }

  // 6. Adjust header row to align hamburger and title
  content = content.replace(
    /<View style=\{styles\.header\}>\s*<TouchableOpacity onPress=\{toggleDrawer\}.*?<\/TouchableOpacity>\s*<Text style=\{styles\.title\}>(.*?)<\/Text>/gs,
    '<View style={styles.header}>\n        <View style={{flexDirection: \'row\', alignItems: \'center\'}}>\n          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}><Text style={styles.menuBtnText}>☰</Text></TouchableOpacity>\n          <Text style={styles.title}>$1</Text>\n        </View>'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', file);
}
