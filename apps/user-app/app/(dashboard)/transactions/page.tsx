import { Card } from "@repo/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";

async function getP2PTransactions() {
  const session = await getServerSession(authOptions);
  const transactions = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        { toUserId: Number(session?.user?.id) },
        { fromUserId: Number(session?.user?.id) },
      ],
    },
  });

  const totalTxns = transactions.map((txn) => ({
    amount: txn.amount,
    id: txn.id,
    time: txn.timestamp,
    from: txn.fromUserId,
    to: txn.toUserId,
  }));

  const recievedTxns = totalTxns.filter(
    (x) => x.to === Number(session?.user?.id)
  );
  const sentTxns = totalTxns.filter(
    (x) => x.from === Number(session?.user?.id)
  );

  return [recievedTxns, sentTxns];
}

async function getWalletTransactions() {
  const session = await getServerSession(authOptions);
  const walletTxns = await prisma.onRampTransaction.findMany({
    where: {
      userId: Number(session?.user?.id),
    },
  });

  return walletTxns.map((x) => ({
    id: x.id,
    status: x.status,
    amount: x.amount / 100,
    time: x.startTime,
  }));
}

export default async function () {
  const [recievedTxns, sentTxns] = await getP2PTransactions();
  const walletTxns = await getWalletTransactions();
  const succTxns = walletTxns.filter((x) => x.status === "Success");
  const pendingTxns = walletTxns.filter((x) => x.status === "Processing");
  const failedTxns = walletTxns.filter((x) => x.status === "Failure");

  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Transactions
      </div>
      <div className="flex m-3 p-3 flex-col">
        <div className="text-2xl text-[#6a51a6] pt-4 mb-4 font-bold">
          P2P Transactions
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 p-2">
          <Card title="Sent Transactions">
            <div className="pt-2">
              {sentTxns ? (
                sentTxns.map((t) => (
                  <div className="flex justify-between mt-2" key={t.id}>
                    <div>
                      <div className="text-sm">Sent INR</div>
                      <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      - Rs {t.amount / 100}
                    </div>
                  </div>
                ))
              ) : (
                <div>No Sent Transactions</div>
              )}
            </div>
          </Card>
          <Card title="Received Transactions">
            <div className="pt-2">
              {recievedTxns ? (
                recievedTxns.map((t) => (
                  <div className="flex justify-between mt-2" key={t.id}>
                    <div>
                      <div className="text-sm">Received INR</div>
                      <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      + Rs {t.amount / 100}
                    </div>
                  </div>
                ))
              ) : (
                <div>No Received Transactions</div>
              )}
            </div>
          </Card>
        </div>
      </div>
      <div className="flex m-3 p-3 flex-col">
        <div className="text-2xl text-[#6a51a6] pt-4 mb-4 font-bold">
          Wallet Transactions
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 p-2">
          <Card title="Successfull Transactions">
            <div className="pt-2">
              {succTxns.length > 0 ? (
                succTxns.map((t) => (
                  <div className="flex justify-between mt-2" key={t.id}>
                    <div>
                      <div className="text-sm">Added To Wallet</div>
                      <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      + Rs {t.amount}
                    </div>
                  </div>
                ))
              ) : (
                <div>No Received Transactions</div>
              )}
            </div>
          </Card>
          <Card title="Processing Transactions">
            <div className="pt-2">
              {pendingTxns.length > 0 ? (
                pendingTxns.map((t) => (
                  <div className="flex justify-between mt-2" key={t.id}>
                    <div>
                      <div className="text-sm">Processing</div>
                      <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      + Rs {t.amount}
                    </div>
                  </div>
                ))
              ) : (
                <div>No Processing Payments</div>
              )}
            </div>
          </Card>
          <Card title="Failure Transactions">
            <div className="pt-2">
              {failedTxns.length > 0 ? (
                failedTxns.map((t) => (
                  <div className="flex justify-between mt-2" key={t.id}>
                    <div>
                      <div className="text-sm">Failed</div>
                      <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      + Rs {t.amount}
                    </div>
                  </div>
                ))
              ) : (
                <div>No Failed Transactions</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
