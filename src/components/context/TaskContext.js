import './connector.css';
import { createContext, useMemo, useState, useContext, useCallback } from 'react';

import { Web3Context } from './Web3Context';

export const TaskContext = createContext({
  tasks: null,
  updateTasks: null,
});

export const TaskConnector = ({ children }) => {
  // console.log('rendering', 'TaskConnector');
  const [tasks, setTasks] = useState([]);

  const { contract, chainId } = useContext(Web3Context);
  // const { walletAddress } = useContext(WalletContext);

  const updateTasks = () => {
    // console.log('calling updateTasks');
    // updateTaskCount();
    contract
      .getAllTaskAndState()
      .then((_tasks, _pendingRevokeTime) => {
        _tasks = _tasks[0].map((task, id) => {
          // console.log('parsing', task);
          return {
            ...task,
            id: id,
            startDate: task.startDate * 1000,
            endDate: task.endDate * 1000,
            vestingTerm: task.vestingTerm * 1000,
            // task.state = getTaskState(task);
          };
        });

        setTasks(_tasks);
      })
      .catch(console.error);
  };

  useMemo(() => {
    // console.log('calling init Tasks');
    updateTasks();
    contract.on(contract.filters.TaskCreated(), updateTasks);
  }, [chainId]);

  const context = {
    tasks: tasks,
    updateTasks: updateTasks,
  };

  return <TaskContext.Provider value={context}>{children}</TaskContext.Provider>;
};
