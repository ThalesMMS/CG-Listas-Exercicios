# Listas de Exercícios

Portal estático com listas e guias de Computação Gráfica e Compiladores.

## Uso no navegador

Abra `index.html` diretamente no navegador ou sirva a pasta com um servidor local estático.

## Build para apps móveis

Os apps iOS e Android são gerados com Capacitor a partir do portal estático existente.

### Pré-requisitos

- Node.js e npm
- Xcode e CocoaPods para iOS
- Android Studio com Android SDK para Android
- JDK 17 ou 21 para Android

### Instalar dependências

```bash
npm install
```

Se o cache global do npm apresentar erro de permissão, use um cache local do projeto:

```bash
npm install --cache .npm-cache
```

### Gerar o bundle web dos apps

```bash
npm run build:app-web
```

Esse comando cria o bundle web em `dist-ios-web/`, que é usado pelos projetos nativos do Capacitor.

### Gerar e sincronizar o app iOS

```bash
npm run ios:sync
```

Esse comando copia o bundle web para `ios/App/App/public/` e sincroniza o projeto nativo com o Capacitor.

### Abrir no Xcode

```bash
npm run ios:open
```

No Xcode, selecione um simulador ou dispositivo e rode o esquema `App`.

### Build via linha de comando

Para validar o build no Simulator sem assinatura:

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Para build em dispositivo real ou distribuição, configure o time de assinatura no Xcode.

## Build para Android

Antes de rodar o build Android pela linha de comando, confirme que o SDK está configurado:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

Se o Java ativo for novo demais para o Gradle, use um JDK LTS:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
```

Em instalações Homebrew sem registro no `java_home`, o caminho costuma ser:

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
```

### Gerar e sincronizar o app Android

```bash
npm run android:sync
```

Esse comando copia o bundle web para `android/app/src/main/assets/public/` e sincroniza o projeto nativo com o Capacitor.

### Abrir no Android Studio

```bash
npm run android:open
```

No Android Studio, selecione um emulador ou dispositivo e rode o módulo `app`.

### Build via linha de comando

Para sincronizar e gerar o APK debug:

```bash
npm run android:build
```

O APK debug fica em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Também é possível rodar o Gradle diretamente:

```bash
cd android
./gradlew assembleDebug
```
