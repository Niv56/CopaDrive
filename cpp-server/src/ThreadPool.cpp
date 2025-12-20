#include "ThreadPool.h"

ThreadPool::ThreadPool(size_t numThreads) {
    if (numThreads == 0) numThreads = 1;

    m_workers.reserve(numThreads);
    for (size_t i = 0; i < numThreads; ++i) {
        m_workers.emplace_back([this]() { workerLoop(); });
    }
}

ThreadPool::~ThreadPool() noexcept {
    shutdown();
}

void ThreadPool::enqueue(std::function<void()> task) {
    if (!task) return;

    {
        std::lock_guard<std::mutex> lock(m_mutex);
        if (m_stopping.load()) {
            throw std::runtime_error("enqueue on stopped ThreadPool");
        }
        m_tasks.push(std::move(task));
    }
    m_cv.notify_one();
}

void ThreadPool::shutdown() noexcept {
    bool expected = false;
    if (!m_stopping.compare_exchange_strong(expected, true)) {
        return; // already stopping/stopped
    }

    m_cv.notify_all();

    for (auto& t : m_workers) {
        if (t.joinable()) t.join();
    }
    m_workers.clear();
}

void ThreadPool::workerLoop() {
    while (true) {
        std::function<void()> task;

        {
            std::unique_lock<std::mutex> lock(m_mutex);
            m_cv.wait(lock, [this]() {
                return m_stopping.load() || !m_tasks.empty();
            });

            if (m_stopping.load() && m_tasks.empty()) {
                return; // clean exit
            }

            task = std::move(m_tasks.front());
            m_tasks.pop();
        }

        try {
            task();
        } catch (...) {
            // swallow exceptions so worker thread never dies
        }
    }
}
