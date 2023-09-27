import './App.css';
import React from 'react';
import audio from './beep-01a.mp3';

const ControlPanel = (props) => {
  return (
    <div className="control-panel">
        <div className="control-panel-subcontainer" id="break-container">
          <div id="break-label">Break Length</div>
          <div className="arrows-container" id="break-arrows-container">
            <div className="arrow-label" id="break-decrement" onClick={props.handleIncrementDecrement}>-</div>
            <div id="break-length"><input type="number" name="break-length" value={props.breakTime} onChange={props.handleChange}/></div>
            <div className="arrow-label" id="break-increment" onClick={props.handleIncrementDecrement}>+</div>
          </div>
        </div>
        <div className="control-panel-subcontainer" id="session-container">
          <div id="session-label">Work Length</div>
            <div className="arrows-container" id="session-arrows-container">
              <div className="arrow-label" id="session-decrement" onClick={props.handleIncrementDecrement}>-</div>
              <div id="session-length"><input type="number" name="work-length" value={props.workTime} onChange={props.handleChange}/></div>
              <div className="arrow-label" id="session-increment" onClick={props.handleIncrementDecrement}>+</div>
            </div>
        </div>
      </div>
  )
}

const beep = new Audio(audio);

const Timer = (props) => {
  const urgentStyle = {
    color: 'red'
  }

  const normalStyle = {
    color: 'black'
  }
  return(
    <div className="timer-container">
        <div id="timer-label">{props.sessionType}</div>
        <div id="time-left" style={props.timeLeft[0] === '0'? urgentStyle : normalStyle}>{props.timeLeft[0]}:{props.timeLeft[1]}</div>
      </div>
  )
}

const TimerControl = (props) => {
  return(
    <div className="timer-control-container">
        <div className="timer-control-label" id="start_stop" onClick={props.handlePlay}>{props.playStatus ? 'Pause' : 'Play'}</div>
        <div className="timer-control-label" id="reset" onClick={props.handleReset}>Reset</div>
      </div>
  )
}

const App = () => {
  const [breakTime, setBreakTime] = React.useState(5);
  const [workTime, setWorkTime] = React.useState(25);
  const [timeLeft, setTimeLeft] = React.useState([String(workTime), '00']);
  const [sessionType, setSessionType] = React.useState('work');
  const [playStatus, setPlayStatus] = React.useState(false);
  const [timerTitle, setTimerTitle] = React.useState('Pomodoro Timer')

  const handleIncrementDecrement = (e) => {
    console.log('incrementing/decrementing');
    if (e.target.id === 'break-increment'){
      setBreakTime(breakTime + 1)
    } else if (e.target.id === 'session-increment'){
      setWorkTime(workTime + 1)
    } else if (e.target.id==='break-decrement'){
      if(breakTime <= 1){
        return
      }
      setBreakTime(breakTime - 1)
    } else if (e.target.id==='session-decrement'){
      if(workTime <= 1){
        return
      }
      setWorkTime(workTime - 1)
    }
  }

  const turnMilisecondsIntoMinutes = (ms) => {
    const minutes_result = String(Math.floor((ms / 1000) / 60));
    const seconds_result = (ms/1000) % 60;
    let seconds_result_string;
    if (seconds_result < 10){
      seconds_result_string = '0' + String(seconds_result)
    } else {
      seconds_result_string = String(seconds_result)
    }
    return [minutes_result, seconds_result_string]
  };

  const turnTimeLeftintoMs = arr => {
    return arr[0] * 1000 * 60 + arr[1] * 1000
  }

  const handlePlay = () => {
    setPlayStatus(!playStatus);
  };

  const handleReset = () => {
    setPlayStatus(false);
    setSessionType('work');
    setTimeLeft([String(workTime), '00']);
  }

  const handleChange = e => {
    if (isNaN(parseInt(e.target.value)) || e.target.value.match(/[^0-9]/g)){
      alert('Only positive integers are allowed')
    }
    let stripped_str = e.target.value.replace(/[^0-9]/g, '');
    if (parseInt(stripped_str) < 1){
      if (e.target.name === 'break-length'){
        setBreakTime(1)
      } else if (e.target.name === 'work-length'){
        setWorkTime(1)
      }
    } else {
      if (e.target.name === 'break-length'){
        setBreakTime(parseInt(stripped_str))
      } else if (e.target.name === 'work-length'){
        setWorkTime(parseInt(stripped_str))
      }
    }
  }

  const handleTitleChange = e => {
    let stripped_str = e.target.value.replace(/[^a-zA-Z0-9._-\s]/g, '');
    setTimerTitle(stripped_str);
  }
  React.useEffect(() => {
    if(playStatus && sessionType==='work'){
      if (workTime === parseInt(timeLeft[0])){
        console.log(sessionType);
        const startTime = new Date().getTime();
        const goalTime = new Date().setTime(startTime + workTime * 60 * 1000);
        let timeDifferenceMs = goalTime - startTime;
        const interval = setInterval(() => {
          timeDifferenceMs = timeDifferenceMs - 1000;
          setTimeLeft(turnMilisecondsIntoMinutes(timeDifferenceMs));
        }, 1000);
        return () => clearInterval(interval);
      } else {
        let timeDifferenceMs = turnTimeLeftintoMs(timeLeft);
        const interval = setInterval(() => {
          timeDifferenceMs = timeDifferenceMs - 1000;
          setTimeLeft(turnMilisecondsIntoMinutes(timeDifferenceMs));
        }, 1000);
        return () => clearInterval(interval);
      }
    } else if(playStatus && sessionType==='break'){
      console.log('starting break timer');
      console.log(sessionType);
      if (breakTime === parseInt(timeLeft[0])){
        const startTime = new Date().getTime();
        const goalTime = new Date().setTime(startTime + breakTime * 60 * 1000);
        let timeDifferenceMs = goalTime - startTime;
        const interval = setInterval(() => {
          timeDifferenceMs = timeDifferenceMs - 1000;
          setTimeLeft(turnMilisecondsIntoMinutes(timeDifferenceMs));
        }, 1000);
        return () => clearInterval(interval);
      } else {
        console.log(timeLeft);
        let timeDifferenceMs = turnTimeLeftintoMs(timeLeft);
        const interval = setInterval(() => {
          timeDifferenceMs = timeDifferenceMs - 1000;
          setTimeLeft(turnMilisecondsIntoMinutes(timeDifferenceMs));
        }, 1000);
        return () => clearInterval(interval);
      }
    }

  }, [playStatus, sessionType]);

  React.useEffect(() => {
    if (!playStatus && sessionType==='work'){
      setTimeLeft([String(workTime), '00'])
    }
    if (isNaN(workTime)){
      setWorkTime(0);
    }
  }, [workTime]);

  React.useEffect(() => {
    if (isNaN(breakTime)){
      setBreakTime(0);
    }
  }, [breakTime]);

  React.useEffect(() => {
    if(timeLeft[0] === '0' && timeLeft[1] === '00'){
      beep.play();
      if (sessionType ==='work'){
        setTimeLeft([String(breakTime), '00']);
        setSessionType('break');
      } else if (sessionType === 'break'){
        setTimeLeft([String(workTime), '00']);
        setSessionType('work');
      }
    }
  }, [timeLeft]);

  return (
    <div className="App">
      <header><h1><input type="text" name="timerTitle" value={timerTitle} onChange={handleTitleChange} /></h1></header>
      <ControlPanel breakTime={breakTime} workTime={workTime} handleIncrementDecrement={handleIncrementDecrement} handleChange={handleChange}/>
      <Timer timeLeft={timeLeft} sessionType={sessionType}/>
      <TimerControl handlePlay={handlePlay} playStatus={playStatus} handleReset={handleReset} />
      <audio>
        <source src={audio} type='audio/mpeg'/>
      </audio>
      <footer>
        <p>A minimalist Pomodoro timer created in React for a FreeCodeCamp project</p>
      </footer>
    </div>
  );
}

export default App;
