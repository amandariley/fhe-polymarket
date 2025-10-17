import { useCallback, useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';

import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';

import '../styles/PredictionApp.css';

type Prediction = {
  id: number;
  title: string;
  options: string[];
  creator: string;
  createdAt: number;
  totalBets: number;
  hasUserBet: boolean;
};

type ActionState = 'register' | 'create' | `bet-${number}` | null;

const EMPTY_MESSAGE = '';

export function PredictionApp() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [remainingBets, setRemainingBets] = useState<number>(0);
  const [betCost, setBetCost] = useState<number>(10);
  const [startingPoints, setStartingPoints] = useState<number>(100);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionState, setActionState] = useState<ActionState>(null);
  const [message, setMessage] = useState<string>(EMPTY_MESSAGE);
  const [error, setError] = useState<string>(EMPTY_MESSAGE);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  const canTransact = useMemo(() => isConnected && !!address, [address, isConnected]);

  const clearFeedback = useCallback(() => {
    setMessage(EMPTY_MESSAGE);
    setError(EMPTY_MESSAGE);
  }, []);

  const decryptEuint32 = useCallback(
    async (handle: string): Promise<number | null> => {
      if (!instance || !address || !signerPromise) {
        return null;
      }

      if (handle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return 0;
      }

      const signer = await signerPromise;
      if (!signer) {
        return null;
      }

      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      const handleContractPairs = [
        {
          handle,
          contractAddress: CONTRACT_ADDRESS,
        },
      ];

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays
      );

      const decrypted = result[handle];
      if (!decrypted) {
        return null;
      }

      return Number(decrypted);
    },
    [address, instance, signerPromise]
  );

  const fetchPredictions = useCallback(
    async (count: bigint, viewerAddress: string | undefined) => {
      if (!publicClient) {
        setPredictions([]);
        return;
      }

      const total = Number(count);
      if (total === 0) {
        setPredictions([]);
        return;
      }

      const indices = Array.from({ length: total }, (_, index) => BigInt(index));

      const fetched = await Promise.all(
        indices.map(async (idBig) => {
          const response = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'getPrediction',
            args: [idBig],
          });

          const hasBet = viewerAddress
            ? await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'hasUserBet',
                args: [idBig, viewerAddress as `0x${string}`],
              })
            : false;

          const options = response[1] as string[];

          return {
            id: Number(idBig),
            title: response[0] as string,
            options,
            creator: response[2] as string,
            createdAt: Number(response[3]),
            totalBets: Number(response[4]),
            hasUserBet: Boolean(hasBet),
          } as Prediction;
        })
      );

      setPredictions(fetched);
    },
    [publicClient]
  );

  const refreshState = useCallback(async () => {
    if (!publicClient || !address) {
      setIsRegistered(false);
      setRemainingBets(0);
      setBalance(null);
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    clearFeedback();

    try {
      const [registeredRaw, remainingRaw, costRaw, startingRaw, countRaw] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'isRegistered',
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getRemainingBets',
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'BET_COST',
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'STARTING_POINTS',
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getPredictionCount',
        }),
      ]);

      const registered = Boolean(registeredRaw);
      const remaining = Number(remainingRaw ?? 0);
      const cost = Number(costRaw ?? 0);
      const starting = Number(startingRaw ?? 0);
      const count = BigInt(countRaw ?? 0n);

      setIsRegistered(registered);
      setRemainingBets(remaining);
      setBetCost(cost);
      setStartingPoints(starting);

      if (registered) {
        const balanceCipher = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getEncryptedBalance',
          args: [address as `0x${string}`],
        });

        const decrypted = await decryptEuint32(balanceCipher as string);
        setBalance(decrypted);
      } else {
        setBalance(null);
      }

      await fetchPredictions(count, address);
    } catch (err) {
      console.error('Failed to refresh state', err);
      setError('Failed to load contract state. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [address, clearFeedback, decryptEuint32, fetchPredictions, publicClient]);

  useEffect(() => {
    if (canTransact) {
      refreshState();
    } else {
      setPredictions([]);
      setBalance(null);
      setIsRegistered(false);
    }
  }, [canTransact, refreshState]);

  const registerUser = async () => {
    if (!canTransact || !signerPromise) {
      setError('Connect your wallet to register.');
      return;
    }

    clearFeedback();
    setActionState('register');

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer not available');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.register();
      await tx.wait();

      setMessage('Registration successful. Your encrypted balance is ready.');
      await refreshState();
    } catch (err) {
      console.error('Register failed', err);
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setActionState(null);
    }
  };

  const [formTitle, setFormTitle] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '']);

  const updateFormOption = (index: number, value: string) => {
    setFormOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addFormOption = () => {
    setFormOptions((prev) => (prev.length < 4 ? [...prev, ''] : prev));
  };

  const removeFormOption = (index: number) => {
    setFormOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const createPrediction = async () => {
    if (!isRegistered) {
      setError('Register before creating predictions.');
      return;
    }
    if (!signerPromise) {
      setError('Wallet signer not available.');
      return;
    }

    const trimmedTitle = formTitle.trim();
    const cleanedOptions = formOptions.map((opt) => opt.trim()).filter(Boolean);

    if (!trimmedTitle) {
      setError('Prediction title is required.');
      return;
    }
    if (cleanedOptions.length < 1 || cleanedOptions.length > 4) {
      setError('Provide between 1 and 4 prediction options.');
      return;
    }

    clearFeedback();
    setActionState('create');

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer not available');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createPrediction(trimmedTitle, cleanedOptions);
      await tx.wait();

      setMessage('Prediction created successfully.');
      setFormTitle('');
      setFormOptions(['', '']);
      await refreshState();
    } catch (err) {
      console.error('Create prediction failed', err);
      setError(err instanceof Error ? err.message : 'Failed to create prediction');
    } finally {
      setActionState(null);
    }
  };

  const selectOption = (predictionId: number, optionIndex: number) => {
    setSelectedOptions((prev) => ({ ...prev, [predictionId]: optionIndex }));
  };

  const placeBet = async (predictionId: number) => {
    if (!isRegistered) {
      setError('Register before placing bets.');
      return;
    }
    if (!instance || !signerPromise || !address) {
      setError('Encryption service or wallet not ready.');
      return;
    }

    const optionIndex = selectedOptions[predictionId];
    if (optionIndex === undefined) {
      setError('Select an option before placing your bet.');
      return;
    }

    clearFeedback();
    setActionState(`bet-${predictionId}`);

    try {
      const encryptionBuffer = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      encryptionBuffer.add32(optionIndex);
      const encrypted = await encryptionBuffer.encrypt();

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer not available');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.placeBet(
        predictionId,
        encrypted.handles[0],
        encrypted.inputProof
      );
      await tx.wait();

      setMessage('Bet submitted successfully. 10 encrypted points deducted.');
      await refreshState();
    } catch (err) {
      console.error('Place bet failed', err);
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setActionState(null);
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="prediction-app">
      <div className="status-banner">
        <div>
          <h2 className="banner-title">Encrypted Prediction Market</h2>
          <p className="banner-subtitle">
            Create markets, decrypt your private balance, and place confidential bets secured by Zama FHE.
          </p>
        </div>
        <div className="banner-summary">
          <span className="summary-item">
            Starting Points: <strong>{startingPoints}</strong>
          </span>
          <span className="summary-item">
            Bet Cost: <strong>{betCost}</strong>
          </span>
        </div>
      </div>

      {zamaError && <div className="error-box">Encryption service error: {zamaError}</div>}

      {!canTransact && (
        <div className="info-box">Connect your wallet to manage encrypted predictions.</div>
      )}

      {canTransact && (
        <div className="grid-two-columns">
          <section className="card">
            <h3 className="card-title">Account</h3>
            <p className="card-description">
              Each registered user receives 100 encrypted points and can place up to 10 bets.
            </p>

            <div className="card-section">
              <span className="card-label">Registration status:</span>
              <span className={`tag ${isRegistered ? 'tag-success' : 'tag-warning'}`}>
                {isRegistered ? 'Registered' : 'Not registered'}
              </span>
            </div>

            <div className="card-section">
              <span className="card-label">Remaining bets:</span>
              <span className="card-value">{remainingBets}</span>
            </div>

            <div className="card-section">
              <span className="card-label">Decrypted balance:</span>
              <span className="card-value">
                {balance === null
                  ? (isRegistered ? 'Decrypting…' : '—')
                  : `${balance} points`}
              </span>
            </div>

            <div className="button-row">
              {!isRegistered && (
                <button
                  className="primary-button"
                  onClick={registerUser}
                  disabled={actionState === 'register' || isLoading}
                >
                  {actionState === 'register' ? 'Registering…' : 'Register Now'}
                </button>
              )}
              <button
                className="secondary-button"
                onClick={refreshState}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Create Prediction</h3>
            <p className="card-description">
              Compose a market with up to four options. Only registered accounts can create predictions.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="prediction-title">Title</label>
              <input
                id="prediction-title"
                type="text"
                className="text-input"
                value={formTitle}
                onChange={(event) => setFormTitle(event.target.value)}
                placeholder="e.g. Will BTC close above $60k on Friday?"
              />
            </div>

            <div className="form-options">
              {formOptions.map((option, index) => (
                <div key={`option-${index}`} className="option-row">
                  <div className="form-group">
                    <label className="form-label">Option {index + 1}</label>
                    <input
                      type="text"
                      className="text-input"
                      value={option}
                      onChange={(event) => updateFormOption(index, event.target.value)}
                      placeholder={`Describe outcome ${index + 1}`}
                    />
                  </div>
                  {formOptions.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeFormOption(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={addFormOption}
                disabled={formOptions.length >= 4}
              >
                Add Option
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={createPrediction}
                disabled={actionState === 'create'}
              >
                {actionState === 'create' ? 'Creating…' : 'Publish Prediction'}
              </button>
            </div>
          </section>
        </div>
      )}

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      {canTransact && (
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Active Predictions</h3>
            <button className="secondary-button" onClick={refreshState} disabled={isLoading}>
              {isLoading ? 'Refreshing…' : 'Reload'}
            </button>
          </div>

          {predictions.length === 0 && (
            <p className="card-description">No predictions yet. Create the first market!</p>
          )}

          {predictions.length > 0 && (
            <div className="prediction-list">
              {predictions.map((prediction) => {
                const selected = selectedOptions[prediction.id];
                const disableBet =
                  prediction.hasUserBet ||
                  remainingBets === 0 ||
                  zamaLoading ||
                  actionState === `bet-${prediction.id}`;

                return (
                  <div key={prediction.id} className="prediction-card">
                    <div className="prediction-header">
                      <h4 className="prediction-title">{prediction.title}</h4>
                      <span className="prediction-meta">
                        Total Bets: {prediction.totalBets}
                      </span>
                    </div>

                    <div className="options-grid">
                      {prediction.options.map((optionLabel, index) => {
                        const isSelected = selected === index;
                        const hasBet = prediction.hasUserBet && isSelected;
                        return (
                          <button
                            key={`${prediction.id}-${optionLabel}`}
                            className={`option-button ${isSelected ? 'option-selected' : ''}`}
                            type="button"
                            onClick={() => selectOption(prediction.id, index)}
                            disabled={prediction.hasUserBet}
                          >
                            <span className="option-index">#{index + 1}</span>
                            <span className="option-label">{optionLabel}</span>
                            {hasBet && <span className="option-badge">My bet</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="prediction-footer">
                      {prediction.hasUserBet ? (
                        <span className="info-text">You already placed an encrypted bet on this market.</span>
                      ) : (
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => placeBet(prediction.id)}
                          disabled={disableBet}
                        >
                          {actionState === `bet-${prediction.id}` ? 'Submitting…' : 'Place Encrypted Bet'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
      </main>
    </div>
  );
}
