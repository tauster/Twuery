import React from 'react';
import Doughnut from 'react-chartjs-2';

import randomColor from 'randomcolor';
import TagCloud from 'react-tag-cloud';

class Results extends React.Component {
  // JSX render.
  render() {
    // Basic data structure for ChartJS. 
    var graphData = {
      datasets: [{
        data: this.props.data,
        backgroundColor: []
      }],
  
      labels: this.props.labels
    };

    // Creates positiveNegative doughnut chart when asked for.
    if(this.props.type === "positiveNegative") {
      graphData.datasets[0].backgroundColor = ["#4CA64C", "#FF4B4B"];
      
      return (<Doughnut data={graphData}/>);
    }

    // Creates positiveNegative doughnut chart when asked for.
    if(this.props.type === "mood") {
      graphData.datasets[0].backgroundColor = ["#F9D423", "#8B0808", "#FF8C94", "#355C7D"];
      
      return (<Doughnut data={graphData}/>);
    }

    // Creates word cloud when asked for.
    else if(this.props.type === "wordCloud") {
      const wordCloudData = this.props.data;
      
      // Creating individual div element needed by TagCloudJS.
      const wordList = wordCloudData.map((word) =>
        <div 
          style={{fontSize: Math.round(Math.log2(word.value) * 15)}}  
          key={word.text.toString()}>{word.text.toString()}
        </div>
      );

      return (
        <div className="canvas-wrap">
          <canvas width="100%" height="600"></canvas>

          <div className='app-outer'>
            <div className='app-inner'>
              <TagCloud 
                className='tag-cloud'
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  //fontSize: () => Math.round(Math.random() * 50) + 16,
                  color: () => randomColor({
                    hue: 'blue'
                  }),
                  padding: 5,
                }}>
                
                {wordList}
                
              </TagCloud>
            </div>
          </div>

        </div>
      );
    }

    // Catching errors.
    else {
      return (
        <h3>Failed to create graph. Please try again.</h3>
      );
    }
  }
}

export default Results;