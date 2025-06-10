const pino = require('pino');
const fs = require('fs');
const path = require('path');

const LOG_PREFIX_NAME = 'executions_'

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

let logger = null;

function getCurrentLogFile() {
    const today = new Date().toISOString().split("T")[0];
    return path.join(logDir, LOG_PREFIX_NAME + `${today}.json`);
}

function getCurrentLogger() {

    const currentLogFile = getCurrentLogFile();
    
    if (!logger || !logger.streams || currentLogFile !== logger.streams[0].dest.path) {
        logger = pino(
            {
                level: 'info',
                timestamp: () => `,"time":"${new Date().toISOString()}"`
            }, pino.multistream([
                // write in file
                { stream: pino.destination({dest: currentLogFile, sync: false}) },
                // show in console
                { stream: pino.destination({dest: 1, sync: false}) },
        
            ])
        );
    }

    return logger;

}

/**
 * Pino levels
 * info : 30
 * debug: 20
 * warn: 40
 * error: 50
 */

class WorkflowLogger {
    
    constructor(workflowName) {
        this.workflowName = workflowName;
        this.logDir = logDir;
        this.executionId = new Date().toISOString().replace(/[:.]/g, '-');
    }

    logExecution(data) {

        const logEntry = {
            workflowName: this.workflowName,
            executionId: this.executionId,
            ...data
        };

        getCurrentLogger().info(logEntry)
        return logEntry;

    }

    logError(error, context = {}) {

        const logEntry = {
            workflowName: this.workflowName,
            executionId: this.executionId,
            status: 'error',
            error: {
                message: error.message,
                stack: error.stack
            },
            context
        }

        getCurrentLogger().error(logEntry)
        return logEntry;

    }

    logSuccess(result, context = {}) {
        const logEntry = {
            workflowName: this.workflowName,
            executionId: this.executionId,
            status: 'success',
            result,
            context
        }

        getCurrentLogger().info(logEntry);
        return logEntry;
    }

    // Get the logs of a specific day
    static async getLogsByDate(date) {
        const logFile = path.join(logDir, LOG_PREFIX_NAME + `${date}.json`);
        try {
            if (fs.existsSync(logFile)) {
                const content = await fs.promises.readFile(logFile, 'utf8');
                // Pino escribe cada línea como un JSON separado
                return content.split('\n')
                    .filter(line => line.trim())
                    .map(line => JSON.parse(line));
            }
        } catch (error) {
            console.error('Error reading logs for date:', date, error);
        }
        return [];
    }

    static async getWorkflowLogsByDate(workflowName, date) {
        const logs = await this.getLogsByDate(date);
        return logs.filter(log => log.workflowName === workflowName);
    }
}

module.exports = WorkflowLogger;