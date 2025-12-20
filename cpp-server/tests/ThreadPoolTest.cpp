#include <gtest/gtest.h>
#include "ThreadPool.h"
#include <atomic>
#include <stdexcept>

// Executes all queued tasks.
TEST(ThreadPoolTest, ExecutesAllTasks) {
    std::atomic<int> counter{0};

    ThreadPool pool(4);
    for (int i = 0; i < 1000; ++i) {
        pool.enqueue([&counter]() { counter.fetch_add(1, std::memory_order_relaxed); });
    }
    pool.shutdown();

    EXPECT_EQ(counter.load(), 1000);
}

// shutdown() is safe to call more than once.
TEST(ThreadPoolTest, ShutdownIsIdempotent) {
    ThreadPool pool(2);
    pool.enqueue([]() {});
    pool.shutdown();
    EXPECT_NO_THROW(pool.shutdown());
}

// enqueue() after shutdown throws.
TEST(ThreadPoolTest, EnqueueAfterShutdownThrows) {
    ThreadPool pool(2);
    pool.shutdown();
    EXPECT_THROW(pool.enqueue([]() {}), std::runtime_error);
}

// Worker threads survive exceptions thrown by tasks.
TEST(ThreadPoolTest, WorkerSurvivesTaskException) {
    std::atomic<int> counter{0};

    ThreadPool pool(2);
    pool.enqueue([]() { throw std::runtime_error("boom"); });
    pool.enqueue([&counter]() { counter.fetch_add(1, std::memory_order_relaxed); });

    pool.shutdown();
    EXPECT_EQ(counter.load(), 1);
}
