import React from 'react';
import axios from 'axios';

class App extends React.Component {
  handleRunScript = async () => {
    try {
      const response = await axios.post('http://localhost:5000/run-script', { /* parâmetros se necessário */ });
      console.log(response.data.message);
      alert('Script executado com sucesso!');
    } catch (error) {
      console.error('Erro ao executar o script', error);
      alert('Erro ao executar o script');
    }
  };

  render() {
    return (
      <div>
        <h1>Puppeteer com React</h1>
        <button onClick={this.handleRunScript}>Executar Script</button>
      </div>
    );
  }
}

export default App;
