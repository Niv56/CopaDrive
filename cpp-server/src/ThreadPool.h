#pragma once
#include <vector>
#include <thread>
#include <queue>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <cstddef>
#include <stdexcept>

class ThreadPool {
public:
    explicit ThreadPool(size_t numThreads);
    ~ThreadPool() noexcept;

    ThreadPool(const ThreadPool&) = delete;
    ThreadPool& operator=(const ThreadPool&) = delete;

    // Throws std::runtime_error if called after shutdown has started.
    void enqueue(std::function<void()> task);

    // Safe to call multiple times.
    void shutdown() noexcept;

private:
    void workerLoop();

    std::vector<std::thread> m_workers;
    std::queue<std::function<void()>> m_tasks;

    std::mutex m_mutex;
    std::condition_variable m_cv;
    std::atomic<bool> m_stopping{false};
};
