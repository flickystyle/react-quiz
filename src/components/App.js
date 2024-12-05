import { useEffect, useReducer } from 'react';
import Header from './Header';
import Main from './Main';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Question from './Question';
import NextButton from './NextButton';

const initialState = {
    questions: [],

    //loading, 'error', 'ready', 'active', 'finished'
    status: 'loading',
    index: 0,
    answer: null,
    totalPoints: 0,
};

function reducer(state, action) {
    switch (action.type) {
        case 'dataReceived':
            return { ...state, questions: action.payload, status: 'ready' };
        case 'dataFailed':
            return { ...state, status: 'error' };
        case 'startQuiz':
            return { ...state, status: 'active' };
        case 'newAnswer':
            const question = state.questions.at(state.index);

            return {
                ...state,
                answer: action.payload,
                totalPoints:
                    action.payload === question.correctOption
                        ? state.totalPoints + question.points
                        : state.totalPoints,
            };
        case 'nextQuestion':
            return { ...state, index: state.index + 1 };
        default:
            throw new Error('Unknown action type');
    }
}

function App() {
    const [{ questions, status, index, answer }, dispatch] = useReducer(
        reducer,
        initialState
    );
    const numQuestions = questions.length;

    useEffect(() => {
        fetch('http://localhost:8000/questions')
            .then((res) => res.json())
            .then((data) => dispatch({ type: 'dataReceived', payload: data }))
            .catch(() => dispatch({ type: 'dataFailed' }));
    }, []);

    return (
        <div className="app">
            <Header />
            <Main>
                {status === 'loading' && <Loader />}
                {status === 'error' && <Error />}
                {status === 'ready' && (
                    <StartScreen
                        numQuestions={numQuestions}
                        dispatch={dispatch}
                    />
                )}
                {status === 'active' && (
                    <>
                        <Question
                            question={questions.at(index)}
                            dispatch={dispatch}
                            answer={answer}
                        />
                        <NextButton dsipatch={dispatch} answer={answer} />
                    </>
                )}
            </Main>
        </div>
    );
}

export default App;
