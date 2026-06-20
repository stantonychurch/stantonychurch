const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'galleries.jsx',
  'journal.jsx',
  'quiz.jsx',
  'videos.jsx',
  'worship.jsx'
];

const dir = path.join(__dirname, 'mobile/app/(member)');

filesToUpdate.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('useRouter')) {
    content = content.replace("import { View,", "import { useRouter } from 'expo-router';\nimport { View,");
  }

  if (!content.includes('const router = useRouter()')) {
    content = content.replace("const { t, lang } = useLanguage();", "const router = useRouter();\n  const { t, lang } = useLanguage();");
    content = content.replace("const { t } = useLanguage();", "const router = useRouter();\n  const { t } = useLanguage();");
  }

  // Regex to find <View style={styles.header}> ... </View>
  const headerRegex = /<View style=\{\[?styles\.header.*?\]?\}>([\s\S]*?)<\/View>/;
  
  const match = content.match(headerRegex);
  if (match) {
    let inner = match[1];
    inner = inner.replace(/<TouchableOpacity[\s\S]*?<\/TouchableOpacity>/, ''); 
    inner = inner.replace(/<View style=\{\{.*?\}\}>([\s\S]*?)<\/View>/, '$1'); // flatten view if exists
    
    const finalHeader = `<View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>${inner.trim()}</View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>`;
      
    content = content.replace(headerRegex, finalHeader);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('Header not matched in ' + file);
  }
});
