import React, { Component } from 'react';
import './App.css';
import $ from 'jquery';
import Results from './components/Results';
import Fade from 'react-reveal/Fade';

class App extends Component {
  // State constructor.
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      positiveNegative: "",
      mood: "",
      wordCloud: "",
      doughnutData: [],
      moodData:[],
      wordCloudData: []
    };
  }

  // Redirect for enter click on search bar.
  searchRedirect(event) {
    if(event.key === "Enter") {
      this.getTwuery();
    }
  }

  // Setting result graphs/visuals.
  setPositiveNegative() {
    this.setState({positiveNegative: <Results type={"positiveNegative"} data={this.state.doughnutData} labels={["Positive (%)", "Negative (%)"]}/>});
  }

  setMood() {
    this.setState({mood: <Results type={"mood"} data={this.state.moodData} labels={["Happy (%)", "Hate (%)", "Love (%)", "Sad (%)"]}/>});
  }

  setWordCloud() {
    this.setState({wordCloud: <Results type={"wordCloud"} data={this.state.wordCloudData}/>});
  }

  // Gathers the text sentiment data and prepares visuals.
  getTwuery() {
    // Storing search term from input.
    var searchTerms = $(".form-control").val();
    
    // Checking to see if the search term is not empty.
    if(searchTerms !== "") {
      // Updating search term on this instance.
      this.setState({searchTerm: searchTerms});
      
      // Forming express API endpoint.
      const urlStr = EC2Instance + searchTerms.replace(' ', '+');
      
      // Fading out results panel from previous session.
      $(".resultsPanel").fadeOut();
      
      // Fading in loading animation.
      $(".loader").fadeIn("slow");
      $(".loaderText").fadeIn("slow");
      
      // Using AJAX to process GET API action.
      $.ajax({
        type: "GET",
        url: urlStr,
        dataType: "json",

        // Fetch success.
        success: (queryResults) => {
          // Fading out loading animation.
          $(".loader").fadeOut();
          $(".loaderText").fadeOut();
          
          // Preparing data for doughnut charts.
          this.setState({doughnutData: [
            (Math.round(queryResults[0].positive * 1000)/10).toFixed(2),
            (Math.round(queryResults[0].negative * 1000)/10).toFixed(2)
          ]});
          
          this.setState({moodData: [
            (Math.round(queryResults[1].happiness * 1000)/10).toFixed(2),
            (Math.round(queryResults[1].hate * 1000)/10).toFixed(2),
            (Math.round(queryResults[1].love * 1000)/10).toFixed(2),
            (Math.round(queryResults[1].sadness * 1000)/10).toFixed(2)
          ]});

          // Fading in results panel.
          $(".resultsPanel").fadeIn("slow");

          // Updating the positiveNegative doughnut chart state with new chart from Results.js.
          this.setPositiveNegative();
          this.setMood();
          
          // Preparing word cloud data.
          var newWordCloudData = []
          for(var key in queryResults[2]) {
            if(queryResults[2].hasOwnProperty(key)) {
              newWordCloudData.push({text: key.toString(), value: queryResults[2][key]});
            }
          }
          this.setState({wordCloudData: newWordCloudData});

          // Updating the wordCloud state with new chart from Results.js.
          this.setWordCloud();
        },

        // Fetch failure.
        error: (xhr, status, err) => {
          console.log("Search failed. API fetching failed. Check server routes.");
          $(".loader").fadeOut();
          $(".loaderText").fadeOut();
        }
      }); 
    }
  }

  // Overlay styling controls.
  infoOverlayOn() {
    $(".overlay").css("display", "block");
    
  }
  infoOverlayOff() {
    $(".overlay").css("display", "none");
  }

  // Updating word cloud for animation.
  componentDidMount() {
    this.wordCloudID = setInterval(
      () => this.setWordCloud(),
      5000
    );
  }

  componentWillUnmount() {
    clearInterval(this.wordCloudID);
  }

  // JSX redner.
  render() {
    return (
      <div className="App">

        {/* Nav Bar */}
        <div className="container-fluid">
          <ul className="nav navbar-right">
            <li><button className="navBtn" onClick={this.infoOverlayOn}><i className="far fa-question-circle"></i></button></li>
          </ul>
        </div>


        <div className="container">
          {/* Main Title */}
          <h1 className="title">Twuery</h1>
          
          <br/>

          {/* Search Bar */}
          <div className="input-group col-sm-12 col-md-8 col-md-offset-2">
            <input type="text" className="form-control" id="searchtext" placeholder="What Twitter is thinking about..." maxLength="50" onKeyDown={this.searchRedirect.bind(this)} />
            <span className="input-group-btn">
              <button className="btn" id="searchbtn" type="button" onClick={this.getTwuery.bind(this)}><i className="fas fa-search"></i></button>
            </span>
          </div>

          {/* Info Overlay */}
          <div className="overlay" onClick={this.infoOverlayOff}>
            <div className="infoOverlay">
              <p>
                Twuery takes your search terms and looks at what’s being said currently on Twitter.
                A machine learning model then gives you an idea of Twitter&apos;s current thoughts on the topic.
                Results will vary with time as Twuery looks at the most recent thoughts on Twitter.
                <br/>
                The results given are not associated with the thoughts of Twuery or toasted.ai.
                <br/>
                <br/>
                Search your interests, curiosities, or current news topics and take a look at what Twitter is thinking.
                <br/>
                <br/>
                Faster implementation, more results, and a public API are currently being developed, stay tuned.
              </p>
            </div>
          </div>

          <br/>
          <br/>

          {/* Loading Animation */}
          <div className="loader"></div>
          <br/>
          <div className="loaderText">Learning...</div>

          <br/>
          <br/>

          {/* Results Panel */}
          <div className="resultsPanel">

            {/* Word Cloud */}
            <div className="viz"><Fade>
              <h2>What Twitter is <b>saying</b> about <i>{this.state.searchTerm}</i></h2>  
              {this.state.wordCloud}
            </Fade></div>

            <br/>
            <br/>
            
            {/* Doughnut Chart */}
            <div className="viz"><Fade>
              <h2>How Twitter <b>feels</b> about <i>{this.state.searchTerm}</i></h2>  
              {this.state.positiveNegative}
              </Fade></div>

            <br/>
            <br/>
            <br/>
            <br/>
            
            <div className="viz"><Fade>
              <h2>Twitter&apos;s <b>mood</b> about <i>{this.state.searchTerm}</i></h2>
              {this.state.mood}
              </Fade></div>

            <br/>
            <br/>
            
            <br/>

          </div>

          <br/>
          <br/>

          {/* toasted.ai Branding */}
          <p className="toasted">made by <a target="_blank" rel="noopener noreferrer" href="http://www.toasted.ai/">toasted.ai</a></p>
          <br/>
        </div>
      </div>
    );
  }
}

export default App;
